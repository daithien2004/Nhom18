import axios from 'axios';
import type { RegisterData, ApiResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/auth';

export const requestOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  try {
    console.log('🔹 [requestOtp] sending data:', data);
    console.log('🔹 [requestOtp] URL:', `${API_URL}/register/request-otp`);

    const response = await axios.post(`${API_URL}/register/request-otp`, data);

    console.log('✅ [requestOtp] response:', response);

    return response.data;
  } catch (error: any) {
    console.error('❌ [requestOtp] error:', error);

    // Nếu muốn xem rõ hơn lỗi từ axios:
    if (error.response) {
      console.error('❌ Response error:', error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    }

    throw error; // vẫn throw ra để chỗ gọi biết có lỗi
  }
};

export const verifyOtp = async (
  data: RegisterData
): Promise<ApiResponse<null>> => {
  return (await axios.post(`${API_URL}/register/verify`, data)).data;
};
