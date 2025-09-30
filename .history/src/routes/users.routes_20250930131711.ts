// src/routes/user.routes.ts (приклад)
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { showFavorite } from '../controllers/user.controller';

const router = Router();

// Цей маршрут доступний лише для авторизованих користувачів
router.get('/favorites', authenticate, showFavorite); 

// ... інші маршрути

export default router;