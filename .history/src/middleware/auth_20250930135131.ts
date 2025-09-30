// src/middleware/auth.ts (або auth.middleware.ts)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 

interface AuthPayload {
    id: string;
    role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. ПЕРЕВІРКА HEADER (Повертаємо тут)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token is required (Format: Bearer <token>)' });
  }

  const token = authHeader.split(' ')[1]; 
  
  // 2. ПЕРЕВІРКА TOKEN (Повертаємо тут)
  if (!token) {
    return res.status(401).json({ error: 'Token missing from header' }); 
  }

  try {
    // 3. УСПІШНА ВЕРИФІКАЦІЯ
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // Обхідний шлях для TS2339
    (req as any).user = decoded; 

    // Успішний шлях: передаємо керування далі
    next();
  } catch (error) {
    // 4. ПОМИЛКА ВЕРИФІКАЦІЇ (Повертаємо тут)
    return res.status(401).json({ error: 'Invalid or expired Access Token' }); 
  }
  // Немає потреби в останньому 'return', оскільки кожен шлях або викликає return, або next().
};