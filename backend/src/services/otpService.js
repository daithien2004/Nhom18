import { Otp } from '../models/index.js';

// Tạo OTP mới
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Tạo thời gian hết hạn OTP (5 phút)
export const generateOtpExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000);
};

// Tạo và lưu OTP
export const createOtp = async (email, otp, expiresAt) => {
  return await Otp.create({ email, otp, expiresAt });
};

// Tìm OTP theo email và mã
export const findOtp = async (email, otp) => {
  return await Otp.findOne({ email, otp });
};

// Kiểm tra OTP có hợp lệ và chưa hết hạn
export const validateOtp = async (email, otp) => {
  const otpRecord = await findOtp(email, otp);
  
  if (!otpRecord) {
    return { isValid: false, message: 'OTP không hợp lệ' };
  }
  
  if (otpRecord.expiresAt < new Date()) {
    return { isValid: false, message: 'OTP đã hết hạn' };
  }
  
  return { isValid: true, otpRecord };
};

// Xóa tất cả OTP của một email
export const deleteOtpByEmail = async (email) => {
  return await Otp.deleteMany({ email });
};

// Xóa OTP cụ thể
export const deleteOtp = async (email, otp) => {
  return await Otp.deleteOne({ email, otp });
};
