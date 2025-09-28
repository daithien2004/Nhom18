import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validation.js';
import {
  getNotifications,
  // createNotification,
} from '../controllers/notificationController.js';
import {
  createNotificationSchema,
  notificationQuerySchema,
} from '../schemas/notificationSchema.js';

const router = Router();

// Lấy danh sách thông báo
router.get('/', auth, validateQuery(notificationQuerySchema), getNotifications);

// Tạo thông báo
// router.post(
//   '/',
//   auth,
//   validateBody(createNotificationSchema),
//   createNotification
// );

export default router;
