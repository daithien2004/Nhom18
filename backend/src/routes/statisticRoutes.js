import { Router } from 'express';
import { getUserStatistics } from '../controllers/statisticController.js';
import auth from '../middlewares/auth.js';

const router = Router();

// Routes cho thống kê của chính mình (cần đăng nhập)
router.get('/', auth, getUserStatistics);

export default router;
