import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { prisma } from '../../config/prisma';

export const cancelApplyLoan = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
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
        message: '올바르지 않은 입력값'
      });
    }

    const applyLoan = await prisma.applyLoan.findUnique({ where: { id: applyLoanId } });
    if (!applyLoan || applyLoan.debtId !== userId) {
      return res.status(404).json({
        message: '존재하지 않는 대출 요청'
      });
    }

    await prisma.applyLoan.delete({ where: { id: applyLoanId, debtId: userId } });

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
