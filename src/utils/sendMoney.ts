import axios from 'axios';
import { prisma } from '../config/prisma';
import { BankResponse, REDIS_KEY } from '../types';
import { checkBalance } from './checkBalance';
import redis from '../config/redis';

const BANK_SERVER_URL = process.env.BANK_SERVER_URL;

export const sendMoney = async (sendUserId: bigint, receiveUserId: bigint, money: number): Promise<BankResponse> => {
  try {
    const sendUserBank = await prisma.bank.findUnique({ where: { userId: sendUserId } });
    const receiveUserBank = await prisma.bank.findUnique({ where: { userId: receiveUserId } });

    if (!sendUserBank || !receiveUserBank) {
      return {
        status: 404,
        message: '존재하지 않는 계좌 정보'
      };
    }

    const openToken = await redis.get(`${REDIS_KEY.OPEN_ACCESS_TOKEN} ${sendUserBank.userId}`);
    if (!openToken) {
      return {
        status: 404,
        message: '등록되지 않은 계좌 정보'
      };
    }
    const checkBalanceResposne = await checkBalance(openToken, sendUserBank.id);
    if (checkBalanceResposne.status !== 200) {
      return {
        status: checkBalanceResposne.status,
        message: checkBalanceResposne.message
      };
    }
    if (checkBalanceResposne.money < money) {
      return {
        status: 400,
        message: '계좌 잔액 부족'
      };
    }

    const sendResponse = await axios.post(`${BANK_SERVER_URL}/send`, {
      sendUserBankId: sendUserBank.id,
      receiveUserBankId: receiveUserBank.id,
      money: money
    });
    if (sendResponse.status !== 0) {
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
    throw new Error('송금 실패');
  }
};
