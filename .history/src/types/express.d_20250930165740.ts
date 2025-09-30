// src/types/express.d.ts
import { User, UserRole } from '@prisma/client';

// Інтерфейс для Payload JWT
interface JwtPayload {
    id: string;
    role: UserRole;
}

declare global {
    namespace Express {
      interface Request {
        user?: AuthPayload;
      }
    }
  }
// Експортуємо порожній об'єкт, щоб TypeScript розглядав файл як модуль
export {};