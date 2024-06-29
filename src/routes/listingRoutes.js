import express from 'express';
import ListingController from '../controllers/ListingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addListingValidation } from '../middleware/listingValidation.js';

const router = express.Router();


router.post('/', authMiddleware, addListingValidation, ListingController.create.bind(ListingController));
router.get('/list', authMiddleware, ListingController.getByUserId.bind(ListingController));
router.get('/recommendations', authMiddleware, ListingController.getRecommendations.bind(ListingController));


export default router;