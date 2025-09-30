import { PrismaClient } from '@prisma/client';

// 1. Оголошуємо змінну клієнта Prisma
let prisma: PrismaClient;

// 2. Логіка для уникнення створення нових екземплярів PrismaClient під час "гарячої" перезавантаження (hot reload)
// Це типовий шаблон для Node.js/TypeScript в режимі розробки, щоб уникнути помилок з кількома пулами з'єднань.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Використовуємо глобальний об'єкт для зберігання екземпляра
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;