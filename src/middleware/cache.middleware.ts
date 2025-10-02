import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cache.service';

export const cacheMiddleware = (duration: number = 300) => { // 5 хвилин за замовчуванням
  return async (req: Request, res: Response, next: NextFunction) => {
    // Кешуємо тільки GET запити
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      // Спробувати отримати дані з кешу
      const cachedData = await cacheService.get(key);
      
      if (cachedData) {
        console.log('Serving from cache:', key);
        return res.json(cachedData);
      }

      // Перехопити оригінальний res.json
      const originalJson = res.json;
      res.json = function(data: any) {
        // Зберегти у кеш
        cacheService.set(key, data, duration)
          .then(() => console.log('Cached:', key))
          .catch(err => console.error('Cache set error:', err));

        // Викликати оригінальний метод
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};