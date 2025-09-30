// src/routes/users.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth'; 
// 💡 Імпортуємо клас, а не іменовану функцію
import { UsersController } from '../controllers/users.controller'; 

const router = Router();

// Ініціалізуємо екземпляр контролера
const usersController = new UsersController(); 

// 1. Маршрут отримання профілю
// Використовуємо .getCurrentUser.bind(usersController) для збереження контексту 'this'
router.get('/me', authenticate, usersController.getCurrentUser.bind(usersController)); 

// 2. Маршрут оновлення профілю
router.put('/me', authenticate, usersController.updateProfile.bind(usersController));

export default router;