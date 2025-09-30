// src/routes/users.routes.ts

import { Router } from 'express';
import { authenticate } from "../middleware/auth"
import { getMyProfile } from '../controllers/auth.controller'; 

const router = Router();

router.get('/me', authenticate, getMyProfile); // Використовуємо getMyProfile

export default router;