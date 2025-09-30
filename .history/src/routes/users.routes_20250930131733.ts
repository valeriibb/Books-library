// src/routes/user.routes.ts (приклад)
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { showFavorite } from '../controllers/user';

const router = Router();

// Цей маршрут доступний лише для авторизованих користувачів
router.get('/favorites', authenticate, showFavorite); 

// ... інші маршрути

export default router;