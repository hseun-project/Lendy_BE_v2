import { prisma } from '../config/prisma';

type Direction = 'increment' | 'decrement';

export const credit = async (userId: bigint, score: number, dir: Direction) => {
  if (score <= 0) {
    throw new Error('점수는 반드시 자연수');
  }
  return prisma.user.update({
    where: { id: userId },
    data: { creditScore: { [dir]: score } }
  });
};

export const incrementCredit = async (userId: bigint, score: number) => {
  credit(userId, score, 'increment');
};

export const decrementCredit = async (userId: bigint, score: number) => {
  credit(userId, score, 'decrement');
};
