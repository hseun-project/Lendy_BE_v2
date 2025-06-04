import { Response } from 'express';
import { BasicResponse, REDIS_KEY, AuthenticatedRequest } from '../../types';
import { TokenResponse } from '../../types/auth';
import redis from '../../config/redis';
import { generateToken } from '../../utils/jwt';
import crypto from 'crypto';

export const refresh = async (req: AuthenticatedRequest, res: Response<TokenResponse | BasicResponse>) => {
  const accessTokenSecond = Number(process.env.ACCESS_TOKEN_SECOND) || 3600;

  try {
    const payload = req.payload;
    if (!payload) {
      return res.status(400).json({
        message: '토큰 검증 실패'
      });
    }
    if (payload.type !== 'refresh') {
      return res.status(400).json({
        message: 'refresh token이 아닙니다'
      });
    }

    const userId = payload.sub;
    if (!userId) {
      return res.status(400).json({
        message: '만료되었거나 확인할 수 없는 토큰'
      });
    }

    const authorization = req.get('Authorization');
    if (!authorization) {
      return res.status(400).json({
        message: '만료되었거나 확인할 수 없는 토큰'
      });
    }
    const token = authorization.split(' ')[1];

    const accessToken = generateToken(userId, crypto.randomUUID(), true);
    await redis.set(`${REDIS_KEY.ACCESS_TOKEN} ${userId}`, accessToken, 'EX', accessTokenSecond);

    return res.status(200).json({
      accessToken: accessToken,
      refreshToken: token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
