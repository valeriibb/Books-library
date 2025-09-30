// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 💡 Важливо: використовуйте той самий секрет, що й у auth.service.ts
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 

// Інтерфейс для Payload токена
interface AuthPayload {
    id: string;
    role: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 💡 ВИПРАВЛЕННЯ TS7030
    return res.status(401).json({ error: 'Authorization token is required (Format: Bearer <token>)' });
  }

  // Заголовок має бути у форматі: 'Bearer <TOKEN>'
  const token = authHeader.split(' ')[1]; 
  
  if (!token) {
    // 💡 ВИПРАВЛЕННЯ TS7030
    return res.status(401).json({ error: 'Token missing from header' });
  }

  try {
    // 1. Верифікація токена
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // 2. Додаємо дані користувача до об'єкта запиту (для подальшого використання)
    // 💡 ВИПРАВЛЕННЯ TS2339: Використовуємо 'as any', щоб TypeScript не сварився.
    (req as any).user = decoded; 

    // 3. Перехід до наступного мідлверу або контролера
    next();
  } catch (error) {
    // Якщо токен недійсний (неправильний секрет, закінчився термін дії)
    // 💡 ВИПРАВЛЕННЯ TS7030
    return res.status(401).json({ error: 'Invalid or expired Access Token' });
  }
};