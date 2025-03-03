import { body, oneOf } from 'express-validator';

export const validateUserInterests = [
    body('interest_id')
        .notEmpty()
        .withMessage('Interest ID cannot be empty')
        .isNumeric()
        .withMessage('Must be a valid Interest id'),
];

export const validateAddCommunity = [
    body('name')
        .notEmpty()
        .withMessage('Community name cannot be empty')
        .isLength({ min: 3 })
        .withMessage('Community name must be at least 3 characters long'),
    body('description')
        .notEmpty()
        .withMessage('Community description cannot be empty')
        .isLength({ min: 5 })
        .withMessage('Community description must be at least 5 characters long'),
]


export const validateCommunityInvite = [
    body('community_id')
        .notEmpty()
        .withMessage('Community ID cannot be empty')
        .isNumeric()
        .withMessage('Must be a valid Community id'),
    oneOf([
        body('email')
            .isEmail()
            .withMessage('Must be a valid email address'),
        body('phone_number')
            .isMobilePhone()
            .withMessage('Must be a valid phone number')
    ], 'Either email or phone number must be provided'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('phone_number')
        .optional()
        .isMobilePhone()
        .withMessage('Must be a valid phone number')
]