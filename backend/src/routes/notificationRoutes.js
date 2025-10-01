import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validation.js';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  // createNotification,
} from '../controllers/notificationController.js';
import {
  createNotificationSchema,
  notificationIdSchema,
  notificationQuerySchema,
} from '../schemas/notificationSchema.js';

const router = Router();

// Lấy danh sách thông báo
router.get('/', auth, validateQuery(notificationQuerySchema), getNotifications);

router.post('/read', auth, markAllAsRead);

router.patch(
  '/:notificationId/read',
  validateParams(notificationIdSchema),
  auth,
  markAsRead
);

// Tạo thông báo
// router.post(
//   '/',
//   auth,
//   validateBody(createNotificationSchema),
//   createNotification
// );

export default router;
