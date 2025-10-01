import { z } from 'zod';

// Schema tạo thông báo
export const createNotificationSchema = z.object({
  message: z.string().min(1, 'message không được để trống'),
  type: z.enum(['like', 'comment', 'follow', 'system']).default('system'),
  metadata: z.record(z.any()).optional(),
});

// Schema query lấy danh sách thông báo
export const notificationQuerySchema = z.object({
  isRead: z.string().optional(),
  page: z.coerce.number().optional(), // ép string -> number
  limit: z.coerce.number().optional(),
});

export const notificationIdSchema = z.object({
  notificationId: z
    .string()
    .min(1, 'notificationId không được để trống')
    .regex(/^[a-f\d]{24}$/i, 'notificationId không hợp lệ'), // nếu là Mongo ObjectId
});
