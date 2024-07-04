import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { registerValidation, loginValidation, refreshTokenValidation } from '../middleware/authValidation.js';

const router = express.Router();

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh/token', refreshTokenValidation, AuthController.refreshToken);

export default router;