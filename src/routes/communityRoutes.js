import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateCommunityInvite } from '../middleware/userMiddleware.js';
import CommunityController from '../controllers/CommunityController.js';

const router = express.Router();

router.post('/invite', validateCommunityInvite, authMiddleware, CommunityController.invite.bind(CommunityController));


export default router;