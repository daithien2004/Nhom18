import * as userRepo from '../repositories/userRepository.js';
import * as emailService from './emailService.js';
import * as otpService from './otpService.js';
import * as passwordService from './passwordService.js';
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
  const otp = otpService.generateOtp();
  const expiresAt = otpService.generateOtpExpiry();

  // Lưu OTP vào database
  await otpService.createOtp(email, otp, expiresAt);

  // Gửi OTP qua email
  await emailService.sendOtpEmail(email, otp);

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
  const otpValidation = await otpService.validateOtp(email, otp);
  if (!otpValidation.isValid) {
    throw new ApiError(400, otpValidation.message);
  }

  // Hash password
  const hashedPassword = await passwordService.hashPassword(password);

  // Tạo user mới
  await userRepo.createUser({
    username,
    email,
    password: hashedPassword,
    phone,
    isVerified: true,
  });

  // Xóa OTP đã sử dụng
  await otpService.deleteOtpByEmail(email);

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
  const otp = otpService.generateOtp();
  const expiresAt = otpService.generateOtpExpiry();

  // Xóa OTP cũ nếu có
  await otpService.deleteOtpByEmail(email);

  // Lưu OTP mới
  await otpService.createOtp(email, otp, expiresAt);

  // Gửi OTP qua email
  await emailService.sendOtpEmail(email, otp);

  return { message: 'OTP đã được gửi về email' };
};

// Xác thực OTP (không đặt lại mật khẩu)
export const verifyPasswordResetOtp = async (email, otp) => {
  const otpValidation = await otpService.validateOtp(email, otp);
  if (!otpValidation.isValid) {
    throw new ApiError(400, otpValidation.message);
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }

  // Chỉ xác thực OTP, không xóa để dùng cho bước tiếp theo
  return { message: 'Xác thực OTP thành công' };
};

// Reset mật khẩu với OTP và mật khẩu mới
export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  // Validate OTP lần nữa
  const otpValidation = await otpService.validateOtp(email, otp);
  if (!otpValidation.isValid) {
    throw new ApiError(400, otpValidation.message);
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }

  // Hash mật khẩu mới
  const hashedPassword = await passwordService.hashPassword(newPassword);

  // Cập nhật password
  user.password = hashedPassword;
  await user.save();

  // Xóa OTP đã sử dụng
  await otpService.deleteOtpByEmail(email);

  return { message: 'Đặt lại mật khẩu thành công' };
};
