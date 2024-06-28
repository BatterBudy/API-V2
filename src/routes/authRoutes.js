import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../middleware/authValidation.js';

const router = express.Router();

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/opt/validate', validateOptValidation, AuthController.validateOtp);

// Protected route example
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// Admin route example
router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: 'Admin access granted' });
});

export default router;