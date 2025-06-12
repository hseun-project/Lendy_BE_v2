import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { LoanState, prisma, RequestLoanState } from '../../config/prisma';

export const changeRepayState = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const repaymentId = BigInt(req.params.repaymentId);
    if (!repaymentId) {
      return res.status(400).json({
        message: '올바르지 않은 파라미터'
      });
    }

    const { state } = req.body;
    if (!state || !(state === RequestLoanState.APPROVED || state === RequestLoanState.REJECTED)) {
      return res.status(400).json({
        message: '올바르지 않은 입력값'
      });
    }

    await prisma.$transaction(async (tx) => {
      const repayment = await tx.repayment.findUnique({ where: { id: repaymentId } });
      if (!repayment || repayment.state !== 'PENDING') {
        return res.status(404).json({
          message: '상환 요청이 없거나 승인 상태가 아님'
        });
      }

      const loan = await tx.loan.findUnique({
        select: {
          id: true,
          money: true,
          repayment: { select: { repayMoney: true }, where: { state: 'APPROVED' } }
        },
        where: { id: repayment.loanId }
      });
      if (!loan) {
        return res.status(404).json({
          message: '존재하지 않는 대출'
        });
      }

      await tx.repayment.update({
        where: { id: repayment.id },
        data: { state: state }
      });
      const totalRepayMoney = loan.repayment.reduce((sum, r) => sum + r.repayMoney, 0);
      if (totalRepayMoney + repayment.repayMoney >= loan.money) {
        await tx.loan.update({
          where: { id: loan.id },
          data: { state: LoanState.COMPLETED }
        });
      }
    });

    return res.status(200).json({
      message: `상환 ${state === RequestLoanState.APPROVED ? '승인' : '거절'} 성공`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
