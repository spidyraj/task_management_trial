import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};
