import { body } from 'express-validator';

export const registerValidation = [
    body('first_name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('First Name must be at least 3 characters long'),
    body('last_name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Last Name must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('phone_number')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Phone Number must be at least 10 characters long'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role')
];

export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

export const refreshTokenValidation = [
    body('refresh_token')
        .notEmpty()
        .withMessage('Refresh token is required')

];


