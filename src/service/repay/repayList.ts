import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { LoanState, prisma } from '../../config/prisma';
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
        startDate: true
      },
      where: { debtId: userId, state: LoanState.ACTIVE }
    });

    if (myRepayList.length === 0) {
      return res.status(200).json([]);
    }

    const repaySum = await prisma.repayment.groupBy({
      by: ['loanId'],
      where: { loanId: { in: myRepayList.map((loan) => loan.id) } },
      _sum: { repayMoney: true }
    });

    const repaySumMap = new Map(repaySum.map((r) => [r.loanId, r._sum.repayMoney ?? 0]));

    const result = myRepayList.map((loan) => ({
      ...loan,
      repayment: repaySumMap.get(loan.id) || 0
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
