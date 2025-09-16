import * as friendService from "../services/friendService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getFriends = asyncHandler(async (req, res) => {
  const friends = await friendService.getFriends(req.user.id);
  return sendSuccess(res, friends, "Lấy danh sách bạn bè thành công");
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const result = await friendService.sendFriendRequest(
    req.user.id,
    req.body.toUserId
  );
  return sendSuccess(res, result, "Gửi lời mời kết bạn thành công");
});

// Lấy danh sách lời mời đã gửi
export const getSentFriendRequests = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const sentRequests = await friendService.getSentFriendRequests(currentUserId);
  return sendSuccess(
    res,
    sentRequests,
    "Lấy danh sách lời mời đã gửi thành công"
  );
});

export const getReceivedFriendRequests = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const receivedRequests = await friendService.getReceivedFriendRequests(
    currentUserId
  );
  return sendSuccess(
    res,
    receivedRequests,
    "Lấy danh sách lời mời đã nhận thành công"
  );
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { fromUserId } = req.body;
  await friendService.acceptFriendRequest(currentUserId, fromUserId);
  return sendSuccess(res, "Đã chấp nhận lời mời kết bạn");
});

export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { fromUserId } = req.body;
  await friendService.rejectFriendRequest(currentUserId, fromUserId);
  return sendSuccess(res, "Đã từ chối lời mời kết bạn");
});

// Tìm kiếm tất cả người dùng
export const searchAllUsers = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const q = req.query.q || "";
  const results = await friendService.searchAllUsers(userId, q);
  return sendSuccess(res, results);
});

// Tìm kiếm chỉ trong danh sách bạn bè
export const searchFriends = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const q = req.query.q || "";
  const results = await friendService.searchFriends(userId, q);
  return sendSuccess(res, results);
});
