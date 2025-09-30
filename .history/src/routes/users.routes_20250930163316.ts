import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const usersController = new UsersController();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', usersController.getCurrentUser.bind(usersController));

// Update user profile
router.patch('/me', usersController.updateProfile.bind(usersController));

// Change password
router.patch('/me/password', usersController.changePassword.bind(usersController));

export default router;