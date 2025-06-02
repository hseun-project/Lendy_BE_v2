import jwt from 'jsonwebtoken';
import ms from 'ms';

const signJWT = (payload: object, expiresIn: ms.StringValue): string => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Secret key is not defined');
  }
  return jwt.sign(payload, secretKey, { algorithm: 'HS256', expiresIn: expiresIn });
};

export const generateToken = (id: string, sub: string, isAccess: boolean): string => {
  const token = signJWT(
    {
      id,
      sub,
      type: isAccess ? 'access' : 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    isAccess ? '1h' : '7d'
  );
  return token;
};
