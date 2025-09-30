// src/routes/user.routes.ts (приклад)
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import  from '../controllers/users.controller';

const router = Router();


router.get('/me', authenticate, getMyProfile);

export default router;