import { body } from 'express-validator';

export const validateOptValidation = [
    body('user_id')
        .notEmpty()
        .withMessage('User ID cannot be empty')
        .isNumeric()
        .withMessage('Must be a valid User id'),
    body('otp_code')
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be at exactly 6 characters long')
];