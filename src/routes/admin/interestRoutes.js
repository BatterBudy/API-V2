import express from 'express';
import InterestController from '../../controllers/admin/InterestController.js';
import { authMiddleware, adminMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', authMiddleware, adminMiddleware, InterestController.create.bind(InterestController));
router.get('/', authMiddleware, adminMiddleware, InterestController.get.bind(InterestController));

export default router;