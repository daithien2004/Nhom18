import instance from '../api/axiosInstant';
import type { LoginResponse, RegisterData, ApiResponse, UserProfile } from '../types/auth';

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const URL_API = '/auth/login';
  const data = { email, password };

  const res = await instance.post<LoginResponse>(URL_API, data);
  return res.data;
};

export const getMe = async (): Promise<{ user: UserProfile }> => {
  const response = await instance.get<{ user: UserProfile }>('/users/me');
  return response.data;
};

// Đăng ký - Bước 1: Gửi OTP
export const requestOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/register/request-otp';
  const response = await instance.post(URL_API, data);
  return response.data;
};

// Đăng ký - Bước 2: Xác thực OTP
export const verifyOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/register/verify-otp';
  return (await instance.post(URL_API, data)).data;
};

// Quên mật khẩu - Bước 1: Gửi OTP
export const forgotPasswordRequestOtp = async (email: string): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/forgot-password/request-otp';
  const response = await instance.post(URL_API, { email });
  return response.data;
};

// Quên mật khẩu - Bước 2: Reset mật khẩu
export const forgotPasswordReset = async (
  email: string,
  otp: string
): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/forgot-password/reset';
  const response = await instance.post(URL_API, { email, otp });
  return response.data;
};
