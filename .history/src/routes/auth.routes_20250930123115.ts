import { Router } from 'express';
// import { AuthController } from ';

const router = Router();
const authController = new AuthController();

// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.post('/refresh', authController.refresh);
// router.post('/logout', authController.logout);

export default router;