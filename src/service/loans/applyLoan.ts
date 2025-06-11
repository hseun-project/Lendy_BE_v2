import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse } from '../../types';
import { prisma, RequestLoanState } from '../../config/prisma';

export const applyLoan = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const { loanType, money, interest, duringType, during, bondId } = req.body;
    if (!loanType || !money || !interest || !duringType || !during || money <= 0 || during <= 0) {
      return res.status(400).json({
        message: '올바르지 않은 입력값'
      });
    }
    if ((loanType === 'PRIVATE_LOAN' && !bondId) || (loanType === 'PUBLIC_LOAN' && bondId)) {
      return res.status(400).json({
        message: '개인 대출 신청에서는 반드시 요청 대상을 지정해야 하며, 공개 대출 신청에서는 요청 대상이 지정되면 안됩니다'
      });
    }

    const interestValue = parseFloat(interest);

    if (isNaN(interestValue) || interestValue > 20) {
      return res.status(400).json({
        message: '최대 이자율 초과'
      });
    }

    const aggregateApplyResult = await prisma.applyLoan.aggregate({ where: { debtId: userId, state: RequestLoanState.PENDING }, _sum: { money: true } });
    const totalApplyMoney = aggregateApplyResult._sum.money || 0;
    if (totalApplyMoney + money > 1000000) {
      return res.status(409).json({
        message: '최대 대출 신청 한도 초과'
      });
    }

    const myLoan = await prisma.loan.findMany({ where: { debtId: userId } });
    if (myLoan) {
      // 신용 점수 감소 API 호출
    }

    const bondUser = bondId ? await prisma.user.findUnique({ where: { id: bondId } }) : undefined;
    if (loanType === 'PRIVATE_LOAN' && !bondUser) {
      return res.status(404).json({
        message: '존재하지 않는 사용자입니다'
      });
    }

    await prisma.applyLoan.create({
      data: {
        debtApply: { connect: { id: userId } },
        applyType: loanType,
        money: money,
        interest: interestValue,
        duringType: duringType,
        during: during,
        ...(bondUser && { bondApply: { connect: { id: bondUser.id } } })
      }
    });

    return res.status(201).json({
      message: '대출 신청 성공'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
