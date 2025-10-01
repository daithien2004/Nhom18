import * as notificationService from '../services/notificationService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// export const createNotification = asyncHandler(async (req, res) => {
//   const notification = await notificationService.createNotification({
//     senderId: req.body.userId,
//     message: req.body.message,
//     type: req.body.type,
//     metadata: req.body.metadata,
//   });

//   // Lấy io từ app
//   const notiIo = req.app.get('notificationIo');
//   // Emit realtime cho các client trong conversation
//   if (notiIo) {
//     notiIo.to(toUser).emit('notification', notification);
//     console.log('Notification sent to:', req.body.userId);
//   }

//   return sendSuccess(res, notification, 'Thêm thông báo thành công', 201);
// });

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications({
    receiverId: req.user.id,
    isRead: req.query.isRead,
    limit: req.query.limit,
    page: req.query.page,
  });
  return sendSuccess(res, notifications, 'Lấy danh sách thông báo thành công');
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.notificationId
  );
  return sendSuccess(res, notification, 'Đã đánh dấu thông báo là đã đọc');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, result, 'Đã đánh dấu tất cả thông báo là đã đọc');
});
