import ListingService from '../services/ListingService.js';
import { validationResult } from 'express-validator';

class ListingController {
    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user_id = req.user.id;
            const listing = await ListingService.create(user_id, req.body);
            res.status(201).json({ listing });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getByUserId(req, res) {
        try {
            const user_id = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const listings = await ListingService.findByUserId(user_id, limit, offset);

            //Return Listing with page number, limit and offset
            res.status(200).json({ listings, page, limit, offset });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getRecommendations(req, res) {
        try {
            const user_id = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            //Return Listing with page number, limit and offset
            const result = await ListingService.getRecommendations(user_id, limit, offset);



            res.status(200).json({ recommendation: result, page, limit, offset });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
export default new ListingController()