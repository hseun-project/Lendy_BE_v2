import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse, REDIS_KEY } from '../../types';
import axios from 'axios';
import redis from '../../config/redis';

const BANK_SERVER_URL = process.env.BANK_SERVER_URL;
if (!BANK_SERVER_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const modifyBank = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const { bankNumber, bankName } = req.body;
    if (!bankNumber || !bankName) {
      return res.status(400).json({
        message: '올바르지 않은 입력 값'
      });
    }

    const accessToken = await redis.get(`${REDIS_KEY.ACCESS_TOKEN}:${userId}`);
    await axios.patch(
      `${BANK_SERVER_URL}`,
      {
        bankName: bankName,
        bankNumber: bankNumber
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return res.status(200).json({
      message: '계좌 설정 완료'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
