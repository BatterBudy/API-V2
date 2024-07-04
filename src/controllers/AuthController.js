import { validationResult } from 'express-validator';
import UserService from '../services/UserService.js';

class AuthController {
    async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await UserService.register(req.body);
            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;
            const data = await UserService.login(email, password);
            res.json({
                message: 'User logged in successfully',
                data
            });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }


    async refreshToken(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { refresh_token } = req.body;
            const data = await UserService.refreshToken(refresh_token);
            res.json({
                message: 'Token refreshed successfully',
                data
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new AuthController();