import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse, REDIS_KEY } from '../../types';
import { prisma } from '../../config/prisma';
import { UserInfoResponse } from '../../types/user';
import { checkBalance } from '../../utils/checkBalance';
import { getBankInfo } from '../../utils/getBankInfo';

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
        creditScore: true
      }
    });
    if (!user) {
      return res.status(404).json({
        message: '존재하지 않는 사용자'
      });
    }

    const bankInfo = await getBankInfo(userId);
    if (bankInfo.status !== 200) {
      return res.status(bankInfo.status).json({
        message: bankInfo.message
      });
    }
    const checkBalanceResponse = await checkBalance(userId);
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
        bankName: bankInfo.data.bankName || '은행명',
        bankNumber: bankInfo.data.bankNumber,
        money: checkBalanceResponse.data.money
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
