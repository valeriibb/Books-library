import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 
// src/middleware/auth.ts (Фрагмент, перевірте всі return)

// ...

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 1. Помилка: відсутній заголовок
      return res.status(401).json({ error: 'Authorization token is required' });
    }
  
    const token = authHeader.split(' ')[1]; 
    
    if (!token) {
      // 2. Помилка: відсутній токен
      return res.status(401).json({ error: 'Token missing from header' }); 
    }
  
    try {
      // 3. Успіх: викликаємо next()
      // ... логіка верифікації
      next();
    } catch (error) {
      // 4. Помилка: недійсний токен
      return res.status(401).json({ error: 'Invalid or expired Access Token' }); 
    }
  };
