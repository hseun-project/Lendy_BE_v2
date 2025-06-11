import redis from '../../config/redis';
import { Request, Response } from 'express';
import { VerifyCodeRequest } from '../../types/auth';
import { BasicResponse } from '../../types';

export const verifyCode = async (req: Request<{}, {}, VerifyCodeRequest>, res: Response<BasicResponse>) => {
  try {
    const { email, code } = req.body;
    const mailCode = await redis.get(email);

    if (!mailCode) {
      return res.status(400).json({
        message: '시간이 초과되었거나 존재하지 않는 이메일'
      });
    }
    if (mailCode !== code) {
      return res.status(409).json({
        message: '코드 불일치'
      });
    }

    return res.status(200).json({
      message: '인증 성공'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
