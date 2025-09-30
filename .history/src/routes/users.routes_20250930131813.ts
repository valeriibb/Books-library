// src/routes/user.routes.ts (приклад)
import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Цей маршрут доступний лише для авторизованих користувачів

// ... інші маршрути

export default router;