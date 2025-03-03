import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateAddCommunity, validateUserInterests } from '../middleware/userMiddleware.js';

const router = express.Router();


router.get('/profile', authMiddleware, UserController.profile.bind(UserController));
router.post('/interest', validateUserInterests, authMiddleware, UserController.addUserInterest.bind(UserController));
router.get('/interest', authMiddleware, UserController.getUserInterests.bind(UserController));
router.post('/profile/picture', authMiddleware, UserController.uploadProfilePicture.bind(UserController));

//Communities
router.post('/community', validateAddCommunity, authMiddleware, UserController.createCommunity.bind(UserController));
router.get('/communities', authMiddleware, UserController.getCommunities.bind(UserController));


export default router;