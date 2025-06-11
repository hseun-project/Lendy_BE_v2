import redis from '../../config/redis';
import { Request, Response } from 'express';
import { createTransport } from 'nodemailer';
import { SendMailRequest } from '../../types/auth';
import { BasicResponse } from '../../types';
import { checkMailRegex } from '../../utils/regex';
import crypto from 'crypto';

const emailId = process.env.EMAIL_ID;
const emailPw = process.env.EMAIL_PW;
if (!emailId || !emailPw) {
  throw Error('환경 변수 로드 실패');
}

export const sendMail = async (req: Request<{}, {}, SendMailRequest>, res: Response<BasicResponse>) => {
  const { email } = req.body;

  if (!checkMailRegex(email)) {
    return res.status(400).json({
      message: '이메일 양식 오류'
    });
  }

  const transport = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailId,
      pass: emailPw
    }
  });

  try {
    const random = crypto.randomBytes(3).toString('hex');

    await transport.sendMail({
      from: emailId,
      to: email,
      subject: 'Lendy 인증 코드',
      text: `인증 코드는 ${random}입니다`
    });

    await redis.set(email, random, 'EX', 600);

    return res.status(200).json({
      message: '메일이 발송되었습니다'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: '서버 오류 발생'
    });
  }
};
