import { DuringType, RequestLoanState } from '../config/prisma';

export interface RepayListData {
  id: bigint;
  money: number;
  duringType: DuringType;
  during: number;
  startDate: Date;
  repayment: number;
}

export interface RepayDetailResponse {
  id: bigint;
  bondName: string;
  bankName: string;
  bankNumber: string;
  money: number;
  duringType: DuringType;
  during: number;
  startDate: Date;
  interest: string;
  repayment: number;
}

export interface RequestRepayListData {
  id: bigint;
  debtName: string;
  repayMoney: number;
  repayInterest: number;
  repayDate: Date;
}

export interface RepayResponse {
  repayMoney: number;
  repayInterest: number;
}
