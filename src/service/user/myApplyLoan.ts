import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { BasicResponse, AuthenticatedRequest } from '../../types';
import { MyApplyLoanData } from '../../types/user';

export const myApplyLoan = async (req: AuthenticatedRequest, res: Response<MyApplyLoanData[] | BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const applyLoans = await prisma.applyLoan.findMany({
      where: { debtId: userId },
      select: {
        id: true,
        applyType: true,
        money: true,
        interest: true,
        duringType: true,
        during: true,
        state: true,
        bondApply: { select: { name: true } }
      }
    });
    const result: MyApplyLoanData[] = applyLoans.map((loan) => ({
      id: loan.id,
      loanType: loan.applyType,
      money: loan.money,
      interest: loan.interest.toString(),
      duringType: loan.duringType,
      during: loan.during,
      bondName: loan.bondApply?.name || null,
      state: loan.state
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
