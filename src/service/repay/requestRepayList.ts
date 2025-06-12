import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { RequestRepayListData } from '../../types/repay';

export const requestRepayList = async (req: AuthenticatedRequest, res: Response<RequestRepayListData[] | BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const repayments = await prisma.repayment.findMany({
      select: {
        id: true,
        repayDate: true,
        repayMoney: true,
        repayInterest: true,
        loan: { select: { debtLoan: { select: { name: true } } } }
      },
      where: { loan: { debtId: userId }, state: 'PENDING' },
      orderBy: { repayDate: 'desc' }
    });

    const result: RequestRepayListData[] = repayments.map((repay) => ({
      id: repay.id,
      debtName: repay.loan.debtLoan.name || '채무자',
      repayMoney: repay.repayMoney,
      repayInterest: repay.repayInterest,
      repayDate: repay.repayDate
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
