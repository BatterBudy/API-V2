import { body } from 'express-validator';

export const addListingValidation = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3 })
        .withMessage('Title must be at least 6 characters long'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 5 })
        .withMessage('Description must be at least 10 characters long'),
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isNumeric()
        .withMessage('Price must be a number')
];