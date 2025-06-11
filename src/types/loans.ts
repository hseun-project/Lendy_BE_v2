import { DuringType } from '../config/prisma';

export interface ApplyUserQuery {
  keyword?: string;
}

export interface ApplyBondUserData {
  id: bigint;
  name: string;
  email: string;
}

export interface RequestLoanListData {
  id: bigint;
  debtName: string;
  creditScore: number;
  money: number;
  duringType: DuringType;
  during: number;
}
