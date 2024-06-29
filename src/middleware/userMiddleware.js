import { body } from 'express-validator';

export const validateUserInterests = [
    body('interest_id')
        .notEmpty()
        .withMessage('Interest ID cannot be empty')
        .isNumeric()
        .withMessage('Must be a valid Interest id'),
];