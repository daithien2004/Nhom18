// routes/activityRoute.js
import { Router } from 'express';
import { getActivities } from '../controllers/activityController.js';
import auth from '../middlewares/auth.js';

const router = Router();

// Lấy danh sách activity của user hiện tại
router.get('/', auth, getActivities);

export default router;
