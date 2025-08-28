import instance from '../api/axiosInstant';
import type { LoginResponse, RegisterData, ApiResponse } from '../types/auth';

// Hàm trả về thẳng dữ liệu server, không có .data
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const URL_API = '/auth/login';
  const data = { email, password };

  const res = await instance.post<LoginResponse>(URL_API, data);
  return res.data;
};

export const requestOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/register/request-otp';
  const response = await instance.post(URL_API, data);

  return response.data;
};

export const verifyOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/register/verify';
  return (await instance.post(URL_API, data)).data;
};

// Gửi email để tạo OTP
export const createOtp = async (email: string): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/create-otp';
  const response = await instance.post(URL_API, { email });
  return response.data;
};

// Gửi OTP để nhận mật khẩu mới
export const sendPassword = async (
  email: string,
  otp: string
): Promise<ApiResponse<null>> => {
  const URL_API = '/auth/send-password';

  const response = await instance.post(URL_API, {
    email,
    otp,
  });
  return response.data;
};
