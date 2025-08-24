import express from 'express';
import { requestOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/register/request-otp', requestOtp);
router.post('/register/verify', verifyOtp);

export default router;
