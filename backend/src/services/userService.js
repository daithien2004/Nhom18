import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { comparePassword } from "./passwordService.js";
import dotenv from "dotenv";

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
