// src/routes/book.routes.ts
import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate } from '../middleware/auth.middleware'; // Використовуйте auth.ts, якщо він так називається
import { authorize } from '../middleware/role.middleware'; // Припускаємо, що ви створили role.middleware.ts
import { UserRole } from '@prisma/client'; 
import { Prisma } from '@prisma/client';

const router = Router();
const bookController = new BookController();

// 1. СТВОРЕННЯ (Тільки для Бібліотекаря/Адміна)
router.post(
  '/', 
  authenticate, 
  authorize([UserRole.LIBRARIAN, UserRole.ADMIN]), 
  bookController.createBook.bind(bookController)
);

// 2. ОНОВЛЕННЯ (Тільки для Бібліотекаря/Адміна)
router.put(
  '/:id', 
  authenticate, 
  authorize([UserRole.LIBRARIAN, UserRole.ADMIN]), 
  bookController.updateBook.bind(bookController)
);

// 3. ВИДАЛЕННЯ (Тільки для Адміна)
router.delete(
  '/:id', 
  authenticate, 
  authorize([UserRole.ADMIN]), 
  bookController.deleteBook.bind(bookController)
);

// 4. ОТРИМАННЯ ОДНОЇ (Доступно для всіх авторизованих)
router.get('/:id', authenticate, bookController.getBookById.bind(bookController));

// 5. ОТРИМАННЯ ВСІХ (Доступно для всіх авторизованих, включає пошук)
router.get('/', authenticate, bookController.getAllBooks.bind(bookController));

export default router;