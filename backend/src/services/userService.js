import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { comparePassword } from "./passwordService.js";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";

dotenv.config();

export const handleLogin = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    return null;
  }

  const isMatchPassword = await comparePassword(password, user.password);
  if (!isMatchPassword) {
    return null;
  }

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return {
    accessToken: access_token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  };
};

/**
 * Update user profile
 * @param {string} userId - ID của user (lấy từ JWT)
 * @param {object} updates - { username, gender, birthday, bio }
 */
export const updateProfile = async (userId, updates) => {
  try {
    // chỉ cho phép cập nhật 4 trường này
    const allowedFields = ["username", "gender", "birthday", "bio"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return { error: "No valid fields to update" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    return updatedUser;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
/**
 * Update avatar or cover photo
 * @param {string} userId - ID của user
 * @param {object} file - file được multer lưu tạm (req.file)
 * @param {"avatar"|"coverPhoto"} type - kiểu update
 */
export const updateUserImage = async (userId, file, type) => {
  if (!file) throw new Error("Không có file upload");

  // Upload lên Cloudinary
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "user_profiles", // thư mục trong Cloudinary
  });

  // Xác định field cần update
  const updateField =
    type === "avatar"
      ? { avatar: result.secure_url }
      : { coverPhoto: result.secure_url };

  // Update vào DB
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateField },
    { new: true }
  ).select("username email avatar coverPhoto");

  if (!user) throw new Error("Không tìm thấy người dùng");

  return user;
};
