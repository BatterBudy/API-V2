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
            res.status(201).json({ user });
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
            const token = await UserService.login(email, password);
            res.json({ token });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async validateOtp(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const opt = await UserService.validateOpt(req.body);
            res.status(202).json({ opt });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new AuthController();