import User from '../models/User.js';

export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findById = async (id) => {
  return await User.findById(id);
};

export const findByIdWithoutPassword = async (id) => {
  return await User.findById(id).select('-password -otp -otpExpires');
};

export const updateById = async (id, updates) => {
  return await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
};

export const updateByIdSelect = async (id, updates, selectFields) => {
  return await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).select(selectFields);
};

export const createUser = async ({ username, email, password, phone }) => {
  return await User.create({ username, email, password, phone });
};

export const getStatusById = async (id) => {
  return await User.findById(id).select('isOnline lastSeen');
};
