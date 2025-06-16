import axios from 'axios';
import redis from '../config/redis';
import { BankResponse, REDIS_KEY } from '../types';

const BANK_SERVER_URL = process.env.BANK_SERVER_URL;
if (!BANK_SERVER_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const getBankInfo = async (userId: bigint): Promise<BankResponse> => {
  try {
    const accessToken = await redis.get(`${REDIS_KEY.ACCESS_TOKEN}:${userId}`);
    if (!accessToken) {
      return {
        status: 400,
        message: '토큰 조회 불가'
      };
    }

    const bankInfoResponse = await axios.get(`${BANK_SERVER_URL}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return {
      status: 200,
      message: '계좌 정보 조회 성공',
      data: {
        bankName: bankInfoResponse.data.bankName,
        bankNumber: bankInfoResponse.data.bankNumber
      }
    };
  } catch (err) {
    throw new Error(`계좌 정보 조회 실패 ${err}`);
  }
};
