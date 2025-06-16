import axios from 'axios';
import { BankResponse, REDIS_KEY } from '../types';
import { checkBalance } from './checkBalance';
import redis from '../config/redis';

const BANK_SERVER_URL = process.env.BANK_SERVER_URL;
if (!BANK_SERVER_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const sendMoney = async (sendUserId: bigint, receiveUserId: bigint, money: number): Promise<BankResponse> => {
  try {
    const accessToken = await redis.get(`${REDIS_KEY.ACCESS_TOKEN}:${sendUserId}`);
    if (!accessToken) {
      return {
        status: 401,
        message: '토큰 조회 불가'
      };
    }
    const checkBalanceResponse = await checkBalance(sendUserId);
    if (!checkBalanceResponse.data) {
      return {
        status: 400,
        message: '계좌 잔액 조회 실패'
      };
    }
    if (checkBalanceResponse.data.money < money) {
      return {
        status: 409,
        message: '계좌 잔액 부족'
      };
    }

    const sendResponse = await axios.post(
      `${BANK_SERVER_URL}/send`,
      {
        sendUserId: sendUserId,
        receiveUserId: receiveUserId,
        money: money
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        timeout: 5000
      }
    );
    if (sendResponse.status !== 200) {
      return {
        status: sendResponse.status,
        message: '송금 실패'
      };
    }

    return {
      status: 200,
      message: '송금 성공'
    };
  } catch (err) {
    throw new Error(`송금 실패 ${err}`);
  }
};
