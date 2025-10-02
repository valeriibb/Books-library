import { Router } from 'express';
import { PasswordController } from '../controllers/password.controller';
import { validate } from '../middleware/validation';
import { forgotPasswordSchema, resetPasswordSchema } from '../dto/auth.dto';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const passwordController = new PasswordController();

router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), passwordController.forgotPassword.bind(passwordController));
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), passwordController.resetPassword.bind(passwordController));
router.get('/validate-reset-token/:token', passwordController.validateResetToken.bind(passwordController));

export default router;