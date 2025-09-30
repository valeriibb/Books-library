// src/global.d.ts
import { PrismaClient } from '@prisma/client';

// Додаємо тип prisma до глобального об'єкта Node.js (globalThis)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}