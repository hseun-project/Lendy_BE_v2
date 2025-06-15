import { Request, Response } from 'express';
import { BasicResponse, REDIS_KEY } from '../../types';
import redis from '../../config/redis';
import { userToken } from './token';
import { userInfo } from './userInfo';

export const openCode = async (req: Request, res: Response<BasicResponse>) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({
        message: '잘못된 요청'
      });
    }

    const codeStr = String(code);

    const userIdStr = await redis.get(`${REDIS_KEY.OPEN_CODE_STATE}:${state}`);
    if (!userIdStr) {
      return res.status(404).json({
        message: '발급되지 않은 state'
      });
    }

    await userToken(codeStr, userIdStr);
    await userInfo(userIdStr);
    await redis.del(`${REDIS_KEY.OPEN_CODE_STATE}:${state}`);

    return res.status(200).json({
      message: '본인 인증 완료'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
