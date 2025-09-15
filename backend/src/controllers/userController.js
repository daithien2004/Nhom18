import * as userService from "../services/userService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Lấy thông tin profile của user hiện tại
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return sendSuccess(res, { user }, "Lấy thông tin profile thành công");
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, { user: updatedUser }, "Cập nhật profile thành công");
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateUserImage(
    req.user.id,
    req.file,
    "avatar"
  );
  return sendSuccess(res, { user }, "Cập nhật avatar thành công");
});

export const updateCoverPhoto = asyncHandler(async (req, res) => {
  const user = await userService.updateUserImage(
    req.user.id,
    req.file,
    "coverPhoto"
  );
  return sendSuccess(res, { user }, "Cập nhật ảnh bìa thành công");
});

export const getFriends = asyncHandler(async (req, res) => {
  const friends = await userService.getFriends(req.user.id);
  return sendSuccess(res, friends, "Lấy danh sách bạn bè thành công");
});

export const getFriendRequests = asyncHandler(async (req, res) => {
  const requests = await userService.getFriendRequests(req.user.id);
  return sendSuccess(res, requests, "Lấy danh sách lời mời kết bạn thành công");
});

export const searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.query.keyword, req.user.id);
  return sendSuccess(res, users, "Tìm kiếm người dùng thành công");
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.sendFriendRequest(
    req.user.id,
    req.body.toUserId
  );
  return sendSuccess(res, result, result.message);
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.acceptFriendRequest(
    req.user.id,
    req.body.fromUserId
  );
  return sendSuccess(res, result, result.message);
});

export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.rejectFriendRequest(
    req.user.id,
    req.body.fromUserId
  );
  return sendSuccess(res, result, result.message);
});
