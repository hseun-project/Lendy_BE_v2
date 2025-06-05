import axios from 'axios';
import { prisma } from '../../config/prisma';
import redis from '../../config/redis';
import { REDIS_KEY } from '../../types';

const OPEN_API_URL = process.env.OPEN_API_URL;
if (!OPEN_API_URL) {
  throw Error('env 변수 불러오기 실패');
}

export const userInfo = async (code: string, userIdStr: string) => {
  try {
    const userSeqNo = await redis.get(`${REDIS_KEY.OPEN_USER_SEQ} ${userIdStr}`);
    const token = await redis.get(`${REDIS_KEY.OPEN_ACCESS_TOKEN} ${userIdStr}`);
    if (!userSeqNo || !token) {
      throw Error('userSeqNo or token is not found');
    }

    const url = `${OPEN_API_URL}/v2.0/user/me?user_seq_no=${userSeqNo}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const { user_name } = res.data;

    const userId = BigInt(userIdStr);

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: user_name
      }
    });
  } catch (err) {
    throw err;
  }
};
