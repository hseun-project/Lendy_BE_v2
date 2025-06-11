import { AuthenticatedRequest, BasicResponse } from '../../types';
import { Response } from 'express';
import { ApplyBondUserData, ApplyUserQuery } from '../../types/apply';
import { prisma } from '../../config/prisma';

const DEFAULT_USER_NAME = '무명';

export const searchBondUser = async (req: AuthenticatedRequest<{}, ApplyUserQuery, {}>, res: Response<ApplyBondUserData[] | BasicResponse>) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        message: '올바르지 않은 입력값'
      });
    }

    const bondUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      },
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: keyword,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: [{ email: 'asc' }, { name: 'asc' }]
    });

    const result: ApplyBondUserData[] = bondUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name || DEFAULT_USER_NAME
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
