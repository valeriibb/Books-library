// src/routes/user.routes.ts (приклад)
import { Router } from 'express';
import { authenticate, getMyProfile } from '../middleware/auth';

const router = Router();

// Цей маршрут доступний лише для авторизованих користувачів

// ... інші маршрути
router.get('/me', authenticate, getMyProfile);

export default router;