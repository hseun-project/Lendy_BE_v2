import axios from 'axios';
import { prisma } from '../../config/prisma';
import redis from '../../config/redis';
import { REDIS_KEY } from '../../types';

const OPEN_API_URL = process.env.OPEN_API_URL;
if (!OPEN_API_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const userInfo = async (userIdStr: string) => {
  try {
    const userSeqNo = await redis.get(`${REDIS_KEY.OPEN_USER_SEQ}:${userIdStr}`);
    const token = await redis.get(`${REDIS_KEY.OPEN_ACCESS_TOKEN}:${userIdStr}`);
    if (!userSeqNo || !token) {
      throw Error('userSeqNo or token is not found');
    }

    const url = `${OPEN_API_URL}/v2.0/user/me?user_seq_no=${userSeqNo}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const { user_name, api_tran_id, res_list } = res.data;
    if (!user_name || !api_tran_id || !res_list || !Array.isArray(res_list) || res_list.length === 0) {
      throw Error('응답 데이터 없음');
    }

    const userId = BigInt(userIdStr);

    const bankData = res_list[0];

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name: user_name }
      }),
      prisma.bank.upsert({
        where: { userId: userId },
        update: {
          bankName: bankData.bank_name,
          bankNumber: bankData.account_num,
          bankNumberMasked: bankData.account_num_masked,
          apiTranId: api_tran_id,
          alias: bankData.account_alias
        },
        create: {
          bankName: bankData.bank_name,
          bankNumber: bankData.account_num,
          bankNumberMasked: bankData.account_num_masked,
          apiTranId: api_tran_id,
          alias: bankData.account_alias,
          userId: userId
        }
      })
    ]);
    await redis.del(`${REDIS_KEY.OPEN_USER_SEQ}:${userIdStr}`);
  } catch (err) {
    throw err;
  }
};
