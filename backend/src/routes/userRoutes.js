import express from 'express';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/home', (req, res) => {
  res.status(200).json('Trang chủ user');
});

router.get('/profile', (req, res) => {
  res.status(200).json('Trang profile');
});

export default router;
