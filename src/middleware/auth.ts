import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/apiError';
import { asyncHandler } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization token is required');
  }

  const token = authHeader.split(' ')[1]; 
  
  if (!token) {
    throw new UnauthorizedError('Token missing');
  }

  const decoded = jwt.verify(token, JWT_SECRET) as any;
    
  // Add user to request
  (req as any).user = {
    id: decoded.userId || decoded.id,
    email: decoded.email,
    role: decoded.role
  };
  
  next();
});