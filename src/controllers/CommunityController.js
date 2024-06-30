import { validationResult } from "express-validator";
import CommunityInviteService from "../services/CommunityInviteService.js";
class CommunityController {

    async invitations(req, res) {

    }


    async invite(req, res, next) {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user_id = req.user.id;
            const result = await CommunityInviteService.create(user_id, req.body);

            res.status(201).json(result);

        } catch (error) {
            // Handle specific errors
            if (error.message === 'User not found') {
                return res.status(404).json({ message: 'User not found' });
            }
            if (error.message === 'User was already invited') {
                return res.status(409).json({ message: 'User was already invited' });
            }

            // For any other unexpected errors, pass to the error handling middleware
            next(error);
        }
    }

}

export default new CommunityController()