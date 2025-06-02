import { PrismaClient, ApplyType, DuringType, RequestLoanState, LoanState } from '@prisma/client';

const prisma = new PrismaClient();
console.log('Prisma has initted');

export { prisma, ApplyType, DuringType, RequestLoanState, LoanState };
