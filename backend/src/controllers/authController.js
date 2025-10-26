import * as userService from '../services/userService.js';
import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const registerRequestOtp = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.requestRegistrationOtp(email, password);
  return sendSuccess(res, result, 'OTP đã được gửi đến email của bạn');
});

export const registerVerifyOtp = asyncHandler(async (req, res) => {
  const { username, email, otp, password, phone } = req.body;
  const result = await authService.verifyRegistrationOtp(
    username,
    email,
    otp,
    password,
    phone
  );
  return sendSuccess(res, result, 'Đăng ký thành công');
});

export const forgotPasswordRequestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.requestPasswordResetOtp(email);
  return sendSuccess(res, result, 'OTP đã được gửi đến email của bạn');
});

// Thêm endpoint mới để verify OTP
export const forgotPasswordVerifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyPasswordResetOtp(email, otp);
  return sendSuccess(res, result, 'Xác thực OTP thành công');
});

// Cập nhật endpoint reset password
export const forgotPasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await authService.resetPasswordWithOtp(
    email,
    otp,
    newPassword
  );
  return sendSuccess(res, result, 'Đặt lại mật khẩu thành công');
});

export const login = asyncHandler(async (req, res) => {
  const data = await userService.login(req.body.email, req.body.password);
  return sendSuccess(res, data, 'Đăng nhập thành công');
});
