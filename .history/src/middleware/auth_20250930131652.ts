// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 💡 Важливо: використовуйте той самий секрет, що й у auth.service.ts
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  // Заголовок має бути у форматі: 'Bearer <TOKEN>'
  const token = authHeader.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ error: 'Token missing from header' });
  }

  try {
    // 1. Верифікація токена
    const decoded = jwt.verify(token, JWT_SECRET);

    // 2. Додаємо дані користувача до об'єкта запиту (для подальшого використання)
    // TypeScript тепер знає про req.user завдяки src/types/express.d.ts
    req.user = decoded as { id: string, role: string }; 

    // 3. Перехід до наступного мідлверу або контролера
    next();
  } catch (error) {
    // Якщо токен недійсний (неправильний секрет, закінчився термін дії)
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};