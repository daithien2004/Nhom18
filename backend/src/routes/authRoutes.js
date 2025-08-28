import express from 'express';
import {
  requestOtp,
  verifyOtp,
  createOtp,
  sendPassword,
  userLogin,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json('Hello world!');
});

router.post('/login', userLogin);
router.post('/register/request-otp', requestOtp);
router.post('/register/verify', verifyOtp);
router.post('/create-otp', createOtp);
router.post('/send-password', sendPassword);

export default router;
