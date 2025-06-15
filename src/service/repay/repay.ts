import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse } from '../../types';
import { LoanState, prisma } from '../../config/prisma';
import { RepayResponse } from '../../types/repay';

export const repay = async (req: AuthenticatedRequest, res: Response<RepayResponse | BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const loanId = req.params.loanId;
    const { money } = req.body;
    if (!loanId || !money) {
      return res.status(400).json({
        message: '올바르지 않은 파라미터'
      });
    }

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      return res.status(404).json({
        message: '존재하지 않는 대출'
      });
    }

    const lastRepayment = await prisma.repayment.findFirst({
      where: { loanId: loan.id },
      orderBy: { repayDate: 'desc' }
    });

    const repayMoneySum = await prisma.repayment.aggregate({
      where: { loanId: loan.id },
      _sum: { repayMoney: true }
    });

    const repayMoney = repayMoneySum._sum.repayMoney ? repayMoneySum._sum.repayMoney : 0;

    const lastRepayDate = lastRepayment?.repayDate ?? loan.startDate;
    const currentDate = new Date();
    const msDiff = currentDate.getTime() - new Date(lastRepayDate).getTime();
    const elapsedDays = Math.max(Math.floor(msDiff / (1000 * 60 * 60 * 24)), 0);

    const annualRate = parseFloat(loan.interest.toString()) / 100;
    const dailyRate = annualRate / 365;
    const interest = Math.floor((loan.money - repayMoney) * dailyRate * elapsedDays);

    if (money <= interest) {
      return res.status(400).json({
        message: '상환 금액은 이자를 초과해야 한다'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.repayment.create({
        data: {
          loanId: loan.id,
          repayDate: currentDate,
          repayInterest: interest,
          repayMoney: money - interest
        }
      });
      if (repayMoney + money >= loan.money) {
        await tx.loan.update({
          where: { id: loan.id },
          data: { state: LoanState.COMPLETED }
        });
      }
    });

    return res.status(201).json({
      repayMoney: money - interest,
      repayInterest: interest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
