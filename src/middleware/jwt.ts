import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayloadData } from '../types';

export const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      res.status(500).json({
        message: 'secret key is not defined'
      });
      return;
    }

    const authorization = req.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({
        message: '토큰 유효성 검사 실패'
      });
      return;
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, secretKey) as JwtPayloadData;
    if (!decoded || !decoded.id || !decoded.sub || !decoded.type || !decoded.iat) {
      res.status(401).json({
        message: '유효하지 않은 토큰 페이로드'
      });
      return;
    }
    req.payload = decoded;

    if (decoded.type === 'access') {
      try {
        const userId = BigInt(decoded.id);
        req.userId = userId;
      } catch (err) {
        res.status(400).json({
          message: '유효하지 않은 사용자 ID'
        });
        return;
      }
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: '토큰 검증 오류 발생'
    });
    return;
  }
};
