import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import { cleanUserData } from '../helpers/userHelpers.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '').split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        var user_id = decoded.userId;
        const user = await UserRepository.findById(user_id);

        if (!user) {
            throw new Error();
        }

        req.user = cleanUserData(user);
        req.token = token;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

export { authMiddleware, adminMiddleware };