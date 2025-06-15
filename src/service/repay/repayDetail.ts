import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { RepayDetailResponse } from '../../types/repay';

export const repayDetail = async (req: AuthenticatedRequest, res: Response<RepayDetailResponse | BasicResponse>) => {
  try {
    const loanId = BigInt(req.params.loanId);
    if (!loanId) {
      return res.status(400).json({
        message: '올바르지 않은 파라미터'
      });
    }

    const repay = await prisma.loan.findUnique({
      select: {
        id: true,
        bondLoan: {
          select: {
            name: true,
            bank: true
          }
        },
        money: true,
        duringType: true,
        during: true,
        startDate: true,
        interest: true,
        repayment: { select: { repayMoney: true } }
      },
      where: { id: loanId }
    });
    if (!repay) {
      return res.status(404).json({
        message: '존재하지 않는 대출'
      });
    }

    const result: RepayDetailResponse = {
      id: repay.id,
      bondName: repay.bondLoan.name ?? '채무자',
      bankName: repay.bondLoan.bank?.bankName || '은행명',
      bankNumber: repay.bondLoan.bank?.bankName || repay.bondLoan.bank?.bankNumberMasked || '계좌번호',
      money: repay.money,
      duringType: repay.duringType,
      during: repay.during,
      startDate: repay.startDate,
      interest: repay.interest.toString(),
      repayment: repay.repayment.reduce((sum, r) => sum + r.repayMoney, 0)
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
