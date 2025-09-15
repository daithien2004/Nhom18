import { z } from "zod";

// Tìm kiếm người dùng
export const searchUserSchema = z.object({
  keyword: z.string().min(1).max(50),
});

// Gửi lời mời kết bạn
export const sendFriendRequestSchema = z.object({
  toUserId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

// Chấp nhận hoặc từ chối lời mời kết bạn
export const respondFriendRequestSchema = z.object({
  fromUserId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
