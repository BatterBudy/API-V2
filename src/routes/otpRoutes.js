import express from 'express';
import OtpController from '../controllers/OtpController.js';
import { validateOptValidation } from '../middleware/otpValidation.js';

const router = express.Router();

router.post('/validate', validateOptValidation, OtpController.validateOtp);

export default router;