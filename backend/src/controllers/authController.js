import { handleLogin } from '../services/userService.js';
import { 
  requestRegistrationOtp, 
  verifyRegistrationOtp, 
  requestPasswordResetOtp, 
  resetPasswordWithOtp 
} from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const registerRequestOtp = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await requestRegistrationOtp(email, password);
  return sendSuccess(res, result, 'OTP đã được gửi đến email của bạn');
});

export const registerVerifyOtp = asyncHandler(async (req, res) => {
  const { username, email, otp, password, phone } = req.body;
  const result = await verifyRegistrationOtp(username, email, otp, password, phone);
  return sendSuccess(res, result, 'Đăng ký thành công');
});

export const forgotPasswordRequestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await requestPasswordResetOtp(email);
  return sendSuccess(res, result, 'OTP đã được gửi đến email của bạn');
});

export const forgotPasswordReset = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await resetPasswordWithOtp(email, otp);
  return sendSuccess(res, result, 'Mật khẩu đã được đặt lại thành công');
});

export const login = asyncHandler(async (req, res) => {
  const data = await handleLogin(req.body.email, req.body.password);
  return sendSuccess(res, data, 'Đăng nhập thành công');
});
