import instance from '../api/axiosInstant';
import type { LoginResponse } from '../types/auth';
import type { RegisterData, ApiResponse } from '../types/auth';

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
  const URL_API = '/register/request-otp';
  const response = await instance.post(URL_API, data);

  return response.data;
};

export const verifyOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  const URL_API = '/register/verify';
  return (await instance.post(URL_API, data)).data;
};
