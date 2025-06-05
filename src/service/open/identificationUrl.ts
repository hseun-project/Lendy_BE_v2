import { Response } from 'express';
import { AuthenticatedRequest, BasicResponse, REDIS_KEY } from '../../types';
import { prisma } from '../../config/prisma';
import crypto from 'crypto';
import { IdentificationUrlResponse } from '../../types/open';
import redis from '../../config/redis';

const CLIENT_ID = process.env.OPEN_API_CLIENT_ID;
const REDIRECTION_URL = process.env.OPEN_API_REDIRECTION_URL;
const OPEN_API_URL = process.env.OPEN_API_URL;
if (!CLIENT_ID || !REDIRECTION_URL || !OPEN_API_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const identificationUrl = async (req: AuthenticatedRequest, res: Response<IdentificationUrlResponse | BasicResponse>) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: '토큰 검증 실패'
      });
    }

    let state = crypto.randomBytes(16).toString('hex');
    state = BigInt('0x' + state)
      .toString()
      .slice(0, 32)
      .padStart(32, '0');

    await redis.set(`${REDIS_KEY.OPEN_CODE_STATE} ${state}`, `${userId}`);

    const url = `${OPEN_API_URL}/oauth/2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECTION_URL}&scope=login+inquiry+transfet&state=${state}&auth_type=0`;
    return res.status(200).json({
      url: url
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 에러 발생'
    });
  }
};
