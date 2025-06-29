import { login } from './auth/login';
import { logout } from './auth/logout';
import { refresh } from './auth/refresh';
import { sendMail } from './auth/sendMail';
import { signUp } from './auth/signup';
import { verifyCode } from './auth/verifyCode';

export default {
  signUp,
  login,
  refresh,
  logout,
  sendMail,
  verifyCode
};
