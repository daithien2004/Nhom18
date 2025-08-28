import express from 'express';
import auth from '../middlewares/auth.js';
import { getProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/home', (req, res) => {
  res.status(200).json('Trang chủ user');
});

// Thêm route để lấy profile user hiện tại
router.get('/me', auth, getProfile);

export default router;
