import { getUserProfile, updateProfile, updateUserImage } from "../services/userService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Lấy thông tin profile của user hiện tại
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  return sendSuccess(res, { user }, "Lấy thông tin profile thành công");
});

export const handleUpdateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await updateProfile(req.user.id, req.body);
  return sendSuccess(res, { user: updatedUser }, "Cập nhật profile thành công");
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await updateUserImage(req.user.id, req.file, "avatar");
  return sendSuccess(res, { user }, "Cập nhật avatar thành công");
});

export const updateCoverPhoto = asyncHandler(async (req, res) => {
  const user = await updateUserImage(req.user.id, req.file, "coverPhoto");
  return sendSuccess(res, { user }, "Cập nhật ảnh bìa thành công");
});
