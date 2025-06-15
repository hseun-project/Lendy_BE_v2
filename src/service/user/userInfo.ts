import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse, REDIS_KEY } from '../../types';
import { prisma } from '../../config/prisma';
import { UserInfoResponse } from '../../types/user';
import axios from 'axios';
import redis from '../../config/redis';
import { checkBalance } from '../../utils/checkBalance';

const bankServerUrl = process.env.BANK_SERVER_URL;
if (!bankServerUrl) {
  throw Error('env 변수 불러오기 실패');
}

export const userInfo = async (req: AuthenticatedRequest, res: Response<BasicResponse | UserInfoResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        creditScore: true,
        bank: { select: { id: true, bankName: true, bankNumber: true, bankNumberMasked: true } }
      }
    });
    if (!user) {
      return res.status(404).json({
        message: '존재하지 않는 사용자'
      });
    }

    const openToken = await redis.get(`${REDIS_KEY.OPEN_ACCESS_TOKEN} ${userId}`);
    if (!openToken || !user.bank?.id) {
      return res.status(404).json({
        message: '등록되지 않은 계좌 정보'
      });
    }
    const checkBalanceResponse = await checkBalance(openToken, user.bank.id);
    if (checkBalanceResponse.status !== 200) {
      return res.status(checkBalanceResponse.status).json({
        message: checkBalanceResponse.message
      });
    }

    return res.status(200).json({
      email: user.email,
      name: user.name || '사용자',
      creditScore: user.creditScore,
      bank: {
        bankName: user.bank?.bankName || '은행명',
        bankNumber: user.bank?.bankNumber || user.bank?.bankNumberMasked || '',
        money: checkBalanceResponse.money
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
