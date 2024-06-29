import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { registerValidation, loginValidation } from '../middleware/authValidation.js';

const router = express.Router();

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

export default router;