import redis from '../../config/redis';
import axios from 'axios';
import qs from 'qs';
import { REDIS_KEY } from '../../types';

const CLIENT_ID = process.env.OPEN_API_CLIENT_ID;
const CLIENT_SECRET = process.env.OPEN_API_SECRET_KEY;
const OPEN_API_URL = process.env.OPEN_API_URL;
const REDIRECTION_URL = process.env.OPEN_API_REDIRECTION_URL;
if (!CLIENT_ID || !CLIENT_SECRET || !OPEN_API_URL || !REDIRECTION_URL) {
  throw Error('env 변수 불러오기 실패');
}

const tokenApiUrl = `${OPEN_API_URL}/oauth/2.0/token`;

export const userToken = async (userCode: string, userId: string) => {
  try {
    const res = await axios.post(
      tokenApiUrl,
      qs.stringify({
        code: userCode,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECTION_URL,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      }
    );

    const { access_token, refresh_token, expires_in, user_seq_no } = res.data;

    await redis.set(`${REDIS_KEY.OPEN_ACCESS_TOKEN} ${userId}`, access_token, 'EX', expires_in);
    await redis.set(`${REDIS_KEY.OPEN_REFRESH_TOKEN} ${userId}`, refresh_token, 'EX', expires_in);
    await redis.set(`${REDIS_KEY.OPEN_USER_SEQ} ${userId}`, user_seq_no, 'EX', expires_in);
  } catch (err) {
    throw err;
  }
};
