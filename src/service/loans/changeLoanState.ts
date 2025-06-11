import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { RequestLoanState, prisma } from '../../config/prisma';

export const changeLoanState = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const applyLoanId = req.params.applyLoanId;
    if (!applyLoanId) {
      return res.status(400).json({
        message: '올바르지 않은 파라미터'
      });
    }

    const state = req.body.state;
    if (!(state === RequestLoanState.APPROVED || state === RequestLoanState.REJECTED)) {
      return res.status(400).json({
        message: '올바르지 않은 요청'
      });
    }

    const applyLoan = await prisma.applyLoan.findUnique({ where: { id: applyLoanId } });
    if (!applyLoan) {
      return res.status(404).json({
        message: '존재하지 않는 대출 요청'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.applyLoan.update({ where: { id: applyLoanId }, data: { state: state } });

      if (state === RequestLoanState.APPROVED) {
        await prisma.loan.create({
          data: {
            debtId: applyLoan.debtId,
            bondId: userId,
            money: applyLoan.money,
            interest: applyLoan.interest,
            duringType: applyLoan.duringType,
            during: applyLoan.during
          }
        });
      }
    });

    return res.status(200).json({
      message: `대출 요청 ${state === RequestLoanState.APPROVED ? '승인' : '거절'} 완료`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
