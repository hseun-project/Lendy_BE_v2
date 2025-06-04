import { Response } from 'express';
import redis from '../../config/redis';
import { BasicResponse, REDIS_KEY, AuthenticatedRequest } from '../../types';

export const logout = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: '토큰 검증 실패'
      });
    }

    await redis.del(`${REDIS_KEY.ACCESS_TOKEN} ${userId}`);
    await redis.del(`${REDIS_KEY.REFRESH_TOKEN} ${userId}`);

    return res.status(200).json({
      message: '로그아웃 성공'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '로그아웃 실패'
    });
  }
};
