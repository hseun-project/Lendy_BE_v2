import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';
import redis from '../../config/redis';
import { TokenResponse, SignRequest } from '../../types/auth';
import crypto from 'crypto';
import { BasicResponse, REDIS_KEY } from '../../types';
import { generateToken } from '../../utils/jwt';

export const login = async (req: Request<{}, {}, SignRequest>, res: Response<TokenResponse | BasicResponse>) => {
  try {
    const { email, password } = req.body;
    const accessTokenSecond = Number(process.env.ACCESS_TOKEN_SECOND) || 3600;
    const refreshTokenSecond = Number(process.env.REFRESH_TOKEN_SECOND) || 604800;

    const thisUser = await prisma.user.findUnique({ where: { email } });
    if (!thisUser) {
      return res.status(404).json({
        message: '존재하지 않는 사용자'
      });
    }
    if (!(await bcrypt.compare(password, thisUser.password))) {
      return res.status(401).json({
        message: '비밀번호 불일치'
      });
    }

    const accessToken = generateToken(thisUser.id.toString(), crypto.randomUUID(), true);
    const refreshToken = generateToken(crypto.randomUUID(), thisUser.id.toString(), false);

    await redis.set(`${REDIS_KEY.ACCESS_TOKEN} ${thisUser.id}`, accessToken, 'EX', accessTokenSecond);
    await redis.set(`${REDIS_KEY.REFRESH_TOKEN} ${thisUser.id}`, refreshToken, 'EX', refreshTokenSecond);

    return res.status(200).json({
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
