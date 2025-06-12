import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { prisma } from '../../config/prisma';

export const requestRepay = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const loanId = BigInt(req.params.loanId);
    const { repayMoney, name } = req.body;
    if (!loanId || !repayMoney || !name) {
      return res.status(400).json({
        message: '올바르지 않은 입력값'
      });
    }

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      return res.status(404).json({
        message: '존재하지 않는 대출'
      });
    }

    const lastRepayment = await prisma.repayment.findFirst({
      where: { loanId: loanId, state: 'APPROVED' },
      orderBy: { repayDate: 'desc' }
    });

    const lastRepayDate = lastRepayment?.repayDate ?? loan.startDate;
    const currentDate = new Date();
    const msDiff = currentDate.getTime() - new Date(lastRepayDate).getTime();
    const elapsedDays = Math.max(Math.floor(msDiff / (1000 * 60 * 60 * 24)), 0);

    const annualRate = parseFloat(loan.interest.toString()) / 100;
    const dailyRate = annualRate / 365;
    const interest = Math.floor(loan.money * dailyRate * elapsedDays);

    await prisma.repayment.create({
      data: {
        loanId: loan.id,
        name: name,
        repayDate: currentDate,
        repayInterest: interest,
        repayMoney: repayMoney - interest
      }
    });

    return res.status(201).json({
      message: '상환 요청 성공'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
