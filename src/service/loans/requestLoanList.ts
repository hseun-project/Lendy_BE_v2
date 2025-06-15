import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { prisma, ApplyType, LoanState, RequestLoanState } from '../../config/prisma';
import { RequestLoanListData } from '../../types/loans';

const DEFAULT_USER_NAME = '무명';

export const requestLoanList = async (req: AuthenticatedRequest, res: Response<RequestLoanListData[] | BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const loanType = req.query.loanType ?? ApplyType.PUBLIC_LOAN;
    if (!(loanType === ApplyType.PRIVATE_LOAN || loanType === ApplyType.PUBLIC_LOAN)) {
      return res.status(400).json({
        message: '올바르지 않은 파라미터'
      });
    }

    const where = {
      applyType: loanType,
      ...(loanType === ApplyType.PRIVATE_LOAN && { bondId: userId }),
      state: RequestLoanState.PENDING
    };

    const requestLoans = await prisma.applyLoan.findMany({
      select: {
        id: true,
        debtApply: {
          select: {
            name: true,
            creditScore: true
          }
        },
        money: true,
        duringType: true,
        during: true
      },
      where: where,
      orderBy: [{ id: 'asc' }]
    });

    const result: RequestLoanListData[] = requestLoans.map((loan) => ({
      id: loan.id,
      debtName: loan.debtApply.name ?? DEFAULT_USER_NAME,
      creditScore: loan.debtApply.creditScore,
      money: loan.money,
      duringType: loan.duringType,
      during: loan.during
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
