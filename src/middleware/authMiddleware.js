import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import { cleanUserData } from '../helpers/userHelpers.js';

const authMiddleware = async (req, res, next) => {
    try {
        // console.log("Logging the entire header", req.header());
        console.log("Logging the Authorization header", req.header('Authorization'));

        const token = req.header('Authorization').replace('Bearer ', '').split(' ')[1];

        console.log("Collecting token", token);
        if (!token) {
            throw new Error('Please authenticate. No token provided');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.user_id;
        const user = await UserRepository.findById(user_id);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = await cleanUserData(user);
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