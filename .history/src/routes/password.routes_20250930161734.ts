import { Router } from 'express';
import { PasswordController } from '../controllers/password.controller';

const router = Router();
const passwordController = new PasswordController();

router.post('/forgot-password', passwordController.forgotPassword.bind(passwordController));
router.post('/reset-password', passwordController.resetPassword.bind(passwordController));
router.get('/validate-reset-token/:token', passwordController.validateResetToken.bind(passwordController));

export default router;