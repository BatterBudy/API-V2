import CommunityService from '../services/CommunityService.js';
import UserService from '../services/UserService.js';
import { validationResult } from 'express-validator';

class UserController {
    async validateOtp(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            await UserService.validateOpt(req.body);
            res.status(202).json({ message: "Opt successfully validated" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async profile(req, res) {
        try {
            console.log(req.user);
            const user_id = req.user.id;
            const userProfile = await UserService.getUserProfile(user_id);
            if (!userProfile) {
                return res.status(404).json({ message: 'User profile not found' });
            }
            res.status(200).json({
                message: 'User profile retrieved successfully',
                data: userProfile
            });
        } catch (error) {
            // Pass any errors to the error handling middleware
            res.status(401).json({ error: error.message });
        }
    }

    async uploadProfilePicture(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user_id = req.user.id;
            console.log(req.body.file);

            const profilePicture = await UserService.uploadProfilePicture(user_id, req.body.file);

            res.status(200).json({
                message: 'Profile picture uploaded successfully',
                data: profilePicture
            });
        } catch (error) {
            // Pass any errors to the error handling middleware
            res.status(400).json({ error: error.message });
        }
    }
    async addUserInterest(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user_id = req.user.id;
            const { interest_id } = req.body;

            const userInterests = await UserService.addUserInterest({ user_id, interest_id });
            if (!userInterests) {
                return res.status(404).json({ message: 'User interests not found' });
            }
            res.status(200).json({
                message: 'User interests added successfully',
                data: userInterests
            });
        } catch (error) {
            // Pass any errors to the error handling middleware
            res.status(401).json({ error: error.message });
        }
    }
    async getUserInterests(req, res) {
        try {
            const user_id = req.user.id;
            const userInterests = await UserService.getUserInterests(user_id);
            if (!userInterests) {
                return res.status(404).json({ message: 'User interests not found' });
            }
            res.status(200).json({
                message: 'User interests retrieved successfully',
                data: userInterests
            });
        } catch (error) {
            // Pass any errors to the error handling middleware
            res.status(401).json({ error: error.message });
        }
    }

    async createCommunity(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user_id = req.user.id;
            await CommunityService.create(user_id, req.body);
            res.status(200).json({
                message: 'Community created successfully',
                data: req.body
            });
        } catch (error) {
            // Pass any errors to the error handling middleware
            res.status(401).json({ error: error.message });
        }
    }

    async getCommunities(req, res) {
        try {
            const user_id = req.user.id;
            const communities = await CommunityService.getCommunities(user_id);
            if (!communities) {
                return res.status(404).json({ message: 'Communities not found' });
            }
            res.status(200).json({
                message: 'Communities retrieved successfully',
                data: communities
            });
        } catch (error) {
            // Pass any errors to the error handling middleware
            res.status(401).json({ error: error.message });
        }
    }
}

export default new UserController();