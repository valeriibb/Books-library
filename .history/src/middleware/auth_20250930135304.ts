import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 

interface AuthPayload {
    id: string;
    role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token is required (Format: Bearer <token>)' });
  }

  const token = authHeader.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ error: 'Token missing from header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as any).user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired Access Token' });
  }
};