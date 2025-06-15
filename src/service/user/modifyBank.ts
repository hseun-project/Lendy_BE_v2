import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse } from '../../types';
import { prisma } from '../../config/prisma';

export const modifyBank = async (req: AuthenticatedRequest, res: Response<BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: '토큰 검증 실패'
      });
    }

    const { bankId, bankNumber, bankName } = req.body;
    if (!bankId || !bankNumber) {
      return res.status(400).json({
        message: '올바르지 않은 입력 값'
      });
    }

    const bank = await prisma.bank.findUnique({ where: { id: bankId } });
    if (!bank || bank.userId !== userId) {
      return res.status(403).json({
        message: '권한이 없습니다'
      });
    }

    await prisma.bank.update({
      where: { id: bank.id },
      data: {
        bankNumber: bankNumber,
        bankName: bankName
      }
    });

    return res.status(200).json({
      message: '계좌 설정 완료'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
