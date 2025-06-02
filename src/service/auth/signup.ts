import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { checkMailRegex, checkPasswordRegex } from '../../utils/regex';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { BasicResponse, REDIS_KEY } from '../../types';
import { SignUpRequest, TokenResponse } from '../../types/auth';
import { generateToken } from '../../utils/jwt';
import redis from '../../config/redis';

export const signUp = async (req: Request<{}, {}, SignUpRequest>, res: Response<TokenResponse | BasicResponse>) => {
  const accessTokenSecond = Number(process.env.ACCESS_TOKEN_SECOND) || 3600;
  const refreshTokenSecond = Number(process.env.REFRESH_TOKEN_SECOND) || 604800;

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: '입력값 없음'
    });
  }
  if (!checkMailRegex(email)) {
    return res.status(400).json({
      message: '이메일 양식 오류'
    });
  }
  if (!checkPasswordRegex(password)) {
    return res.status(400).json({
      message: '비밀번호 양식 오류'
    });
  }
  try {
    const thisMailUser = await prisma.user.findUnique({ where: { email } });
    if (thisMailUser) {
      return res.status(409).json({
        message: '이미 가입된 메일'
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hash
      }
    });

    const accessToken = await generateToken(user.id.toString(), crypto.randomUUID(), true);
    const refreshToken = await generateToken(crypto.randomUUID(), user.id.toString(), false);

    await redis.set(`${REDIS_KEY.ACCESS_TOKEN} ${user.id}`, accessToken, 'EX', accessTokenSecond);
    await redis.set(`${REDIS_KEY.REFRESH_TOKEN} ${user.id}`, refreshToken, 'EX', refreshTokenSecond);

    return res.status(201).json({
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
