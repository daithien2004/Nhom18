import axios from 'axios';
import type { RegisterData, ApiResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/auth';

export const requestOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post(`${API_URL}/register/request-otp`, data);

    return response.data;
  } catch (error: any) {
    console.error('❌ [requestOtp] error:', error);
    throw error; // vẫn throw ra để chỗ gọi biết có lỗi
  }
};

export const verifyOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  return (await axios.post(`${API_URL}/register/verify`, data)).data;
};
