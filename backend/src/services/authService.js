import * as userRepo from '../repositories/userRepository.js';
import { sendOtpEmail } from './emailService.js';
import {
  generateOtp,
  generateOtpExpiry,
  createOtp,
  validateOtp,
  deleteOtpByEmail,
} from './otpService.js';
import { hashPassword, generateAndHashPassword } from './passwordService.js';
import ApiError from '../utils/apiError.js';

// Kiểm tra email đã tồn tại
export const checkEmailExists = async (email) => {
  const existingUser = await userRepo.findByEmail(email);
  return existingUser !== null;
};

// Tạo OTP và gửi email cho đăng ký
export const requestRegistrationOtp = async (email, password) => {
  // Kiểm tra email đã tồn tại
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    throw new ApiError(400, 'Email đã tồn tại');
  }

  // Tạo OTP mới
  const otp = generateOtp();
  const expiresAt = generateOtpExpiry();

  // Lưu OTP vào database
  await createOtp(email, otp, expiresAt);

  // Gửi OTP qua email
  await sendOtpEmail(email, otp);

  return { message: 'OTP đã gửi tới email' };
};

// Xác thực OTP và tạo user mới
export const verifyRegistrationOtp = async (
  username,
  email,
  otp,
  password,
  phone
) => {
  // Validate OTP
  const otpValidation = await validateOtp(email, otp);
  if (!otpValidation.isValid) {
    throw new ApiError(400, otpValidation.message);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Tạo user mới
  await userRepo.createUser({
    username,
    email,
    password: hashedPassword,
    phone,
  });

  // Xóa OTP đã sử dụng
  await deleteOtpByEmail(email);

  return { message: 'Đăng ký thành công' };
};

// Tạo OTP cho quên mật khẩu
export const requestPasswordResetOtp = async (email) => {
  // Kiểm tra user có tồn tại
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }

  // Tạo OTP mới
  const otp = generateOtp();
  const expiresAt = generateOtpExpiry();

  // Xóa OTP cũ nếu có
  await deleteOtpByEmail(email);

  // Lưu OTP mới
  await createOtp(email, otp, expiresAt);

  // Gửi OTP qua email
  await sendOtpEmail(email, otp);

  return { message: 'OTP đã được gửi về email' };
};

// Reset mật khẩu với OTP
export const resetPasswordWithOtp = async (email, otp) => {
  // Validate OTP
  const otpValidation = await validateOtp(email, otp);
  if (!otpValidation.isValid) {
    throw new ApiError(400, otpValidation.message);
  }

  // Kiểm tra user có tồn tại
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }

  // Tạo password mới và hash
  const { plainPassword, hashedPassword } = await generateAndHashPassword();

  // Cập nhật password
  user.password = hashedPassword;
  await user.save();

  // Gửi password mới qua email
  await sendOtpEmail(email, `Mật khẩu mới của bạn là: ${plainPassword}`);

  // Xóa OTP đã sử dụng
  await deleteOtpByEmail(email);

  return { message: 'Mật khẩu mới đã được gửi về email' };
};
