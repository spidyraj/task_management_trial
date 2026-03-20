import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_SECRET!, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.REFRESH_SECRET!) as JWTPayload;
};
