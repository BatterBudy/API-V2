import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/profile', authMiddleware, UserController.profile.bind(UserController));


// Admin route example
router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: 'Admin access granted' });
});

export default router;