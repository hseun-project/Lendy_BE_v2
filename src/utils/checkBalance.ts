import axios from 'axios';
import { BankResponse } from '../types';

const BANK_SERVER_URL = process.env.BANK_SERVER_URL;

export const checkBalance = async (token: string, bankId: bigint): Promise<CheckBalanceResponse> => {
  try {
    const response = await axios.get(`${BANK_SERVER_URL}/${bankId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });
    if (!response) {
      return {
        status: 404,
        message: '계좌 잔액 조회 불가',
        money: 0
      };
    }
    return {
      status: 200,
      message: '계좌 잔액 조회 성공',
      money: response.data.money
    };
  } catch (err) {
    throw new Error('계좌 잔액 조회 불가');
  }
};

interface CheckBalanceResponse extends BankResponse {
  money: number;
}
