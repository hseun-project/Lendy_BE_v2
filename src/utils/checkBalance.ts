import axios from 'axios';
import { BankResponse, REDIS_KEY } from '../types';
import redis from '../config/redis';

const BANK_SERVER_URL = process.env.BANK_SERVER_URL;
if (!BANK_SERVER_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const checkBalance = async (userId: bigint): Promise<BankResponse<{ money: number }>> => {
  try {
    const accessToken = await redis.get(`${REDIS_KEY.ACCESS_TOKEN}:${userId}`);
    if (!accessToken) {
      return {
        status: 401,
        message: '토큰 조회 실패'
      };
    }
    const response = await axios.get(`${BANK_SERVER_URL}/money`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      timeout: 5000
    });
    return {
      status: 200,
      message: '계좌 잔액 조회 성공',
      data: { money: response.data.money }
    };
  } catch (err) {
    throw new Error(`계좌 잔액 조회 불가 ${err}`);
  }
};
