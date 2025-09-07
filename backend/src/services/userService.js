import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/apiError.js';
import { comparePassword } from './passwordService.js';
import * as userRepo from '../repositories/userRepository.js';

dotenv.config();

export const handleLogin = async (email, password) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Email hoặc password không đúng');
  }

  const isMatchPassword = await comparePassword(password, user.password);
  if (!isMatchPassword) {
    throw new ApiError(401, 'Email hoặc password không đúng');
  }

  const payload = { id: user.id, email: user.email, username: user.username };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return {
    accessToken,
    user: { id: user.id, email: user.email, username: user.username },
  };
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, updates) => {
  const allowedFields = ['username', 'gender', 'birthday', 'bio'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) updateData[field] = updates[field];
  });

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No valid fields to update');
  }

  const updatedUser = await userRepo.updateById(userId, updateData);
  if (!updatedUser) throw new ApiError(404, 'User not found');

  return updatedUser;
};

/**
 * Update avatar or cover photo
 */
export const updateUserImage = async (userId, file, type) => {
  if (!file) throw new ApiError(400, 'Không có file upload');

  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'user_profiles',
  });
  const updateField =
    type === 'avatar'
      ? { avatar: result.secure_url }
      : { coverPhoto: result.secure_url };

  const user = await userRepo.updateByIdSelect(
    userId,
    updateField,
    'username email avatar coverPhoto'
  );
  if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');

  return user;
};

/**
 * Get profile
 */
export const getUserProfile = async (userId) => {
  const user = await userRepo.findByIdWithoutPassword(userId);
  if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
  return user;
};
