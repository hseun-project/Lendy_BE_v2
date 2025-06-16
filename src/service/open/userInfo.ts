import axios from 'axios';
import { prisma } from '../../config/prisma';
import redis from '../../config/redis';
import { REDIS_KEY } from '../../types';

const OPEN_API_URL = process.env.OPEN_API_URL;
const BANK_SERVER_URL = process.env.BANK_SERVER_URL;
if (!OPEN_API_URL || !BANK_SERVER_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const userInfo = async (userIdStr: string) => {
  try {
    const [userSeqNo, token] = await redis.mget(`${REDIS_KEY.OPEN_USER_SEQ}:${userIdStr}`, `${REDIS_KEY.OPEN_ACCESS_TOKEN}:${userIdStr}`);
    if (!userSeqNo || !token) {
      throw Error('userSeqNo or token is not found');
    }

    const url = `${OPEN_API_URL}/v2.0/user/me?user_seq_no=${userSeqNo}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });
    const { user_name, api_tran_id, res_list } = res.data;
    if (!user_name || !api_tran_id || !res_list || !Array.isArray(res_list) || res_list.length === 0) {
      throw Error('응답 데이터 없음');
    }

    const userId = BigInt(userIdStr);

    const bankData = res_list[0];

    await prisma.user.update({
      where: { id: userId },
      data: { name: user_name }
    });
    await axios.post(
      `${BANK_SERVER_URL}`,
      {
        bankName: bankData.bank_name,
        bankNumber: bankData.account_num,
        bankNumerMasked: bankData.account_num_masked,
        apiTranId: api_tran_id
      },
      {
        timeout: 5000
      }
    );

    await redis.del(`${REDIS_KEY.OPEN_USER_SEQ}:${userIdStr}`);
  } catch (err) {
    throw err;
  }
};
