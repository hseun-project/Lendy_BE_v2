import { prisma } from '../config/prisma';

export const incrementCredit = async (userId: bigint, score: number) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { creditScore: { increment: score } }
    });
  } catch (err) {
    throw err;
  }
};

export const decrementCredit = async (userId: bigint, score: number) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { creditScore: { decrement: score } }
    });
  } catch (err) {
    throw err;
  }
};
