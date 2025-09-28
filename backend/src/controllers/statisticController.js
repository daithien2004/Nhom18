import * as statisticService from "../services/statisticService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Lấy thống kê tổng hợp của người dùng
export const getUserStatistics = asyncHandler(async (req, res) => {
  const result = await statisticService.getUserStatistics(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy tổng lượt thích của người dùng
export const getTotalLikes = asyncHandler(async (req, res) => {
  const result = await statisticService.getTotalLikes(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy tổng lượt bình luận của người dùng
export const getTotalComments = asyncHandler(async (req, res) => {
  const result = await statisticService.getTotalComments(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy tổng số bạn bè của người dùng
export const getTotalFriends = asyncHandler(async (req, res) => {
  const result = await statisticService.getTotalFriends(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy tổng số bài đăng của người dùng
export const getTotalPosts = asyncHandler(async (req, res) => {
  const result = await statisticService.getTotalPosts(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy danh sách lượt thích theo từng bài viết
export const getLikesByPost = asyncHandler(async (req, res) => {
  const result = await statisticService.getLikesByPost(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy thống kê lượt thích chi tiết cho từng bài viết
export const getDetailedLikesByPost = asyncHandler(async (req, res) => {
  const result = await statisticService.getDetailedLikesByPost(req.user.id);
  return sendSuccess(res, result.data, result.message);
});

// Lấy thống kê theo loại (likes, comments, friends)
export const getStatisticsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const result = await statisticService.getStatisticsByType(req.user.id, type);
  return sendSuccess(res, result.data, result.message);
});

// Lấy thống kê của người dùng khác (admin hoặc public stats)
export const getOtherUserStatistics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await statisticService.getUserStatistics(userId);
  return sendSuccess(res, result.data, result.message);
});

// Lấy thống kê lượt thích của người dùng khác
export const getOtherUserLikes = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await statisticService.getLikesByPost(userId);
  return sendSuccess(res, result.data, result.message);
});

// Lấy thống kê chi tiết lượt thích của người dùng khác
export const getOtherUserDetailedLikes = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await statisticService.getDetailedLikesByPost(userId);
  return sendSuccess(res, result.data, result.message);
});
