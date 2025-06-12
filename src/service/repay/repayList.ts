import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { RepayListData } from '../../types/repay';

export const repayList = async (req: AuthenticatedRequest, res: Response<RepayListData[] | BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const myRepayList = await prisma.loan.findMany({
      select: {
        id: true,
        money: true,
        duringType: true,
        during: true,
        startDate: true,
        repayment: { select: { repayMoney: true } }
      },
      where: { debtId: userId }
    });

    const result = myRepayList.map((loan) => {
      const totalRepay = loan.repayment.reduce((sum, r) => sum + r.repayMoney, 0);
      return { ...loan, repayment: totalRepay };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
