import { DuringType } from '../config/prisma';

export interface RepayListData {
  id: bigint;
  money: number;
  duringType: DuringType;
  during: number;
  startDate: Date;
  repayment: number;
}
