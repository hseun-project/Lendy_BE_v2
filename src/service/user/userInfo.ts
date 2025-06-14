import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse } from '../../types';
import { prisma } from '../../config/prisma';
import { UserInfoResponse } from '../../types/user';

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
        bank: { select: { bankName: true, bankNumber: true, bankNumberMasked: true } }
      }
    });
    if (!user) {
      return res.status(404).json({
        message: '존재하지 않는 사용자'
      });
    }

    return res.status(200).json({
      email: user.email,
      name: user.name || '사용자',
      creditScore: user.creditScore,
      bank: {
        bankName: user.bank?.bankName || '은행명',
        bankNumber: user.bank?.bankNumber || user.bank?.bankNumberMasked || ''
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
