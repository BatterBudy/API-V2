import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateUserInterests } from '../middleware/userMiddleware.js';

const router = express.Router();


router.get('/profile', authMiddleware, UserController.profile.bind(UserController));
router.post('/interest', validateUserInterests, authMiddleware, UserController.addUserInterest.bind(UserController));
router.get('/interest', authMiddleware, UserController.getUserInterests.bind(UserController));


export default router;