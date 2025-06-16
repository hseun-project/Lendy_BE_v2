import { ApplyType, DuringType, RequestLoanState } from '../config/prisma';

export interface UserInfoResponse {
  email: string;
  name: string;
  creditScore: number;
  bank: {
    bankName: string;
    bankNumber: string;
    money: number;
  };
}

export interface MyApplyLoanData {
  id: bigint;
  loanType: ApplyType;
  money: number;
  interest: string;
  duringType: DuringType;
  during: number;
  bondName: string | null;
  state: RequestLoanState;
}
