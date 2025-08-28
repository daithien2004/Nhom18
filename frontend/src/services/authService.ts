import axios from "axios";
import type { ApiResponse } from "../types/auth";

const API_URL = "http://localhost:3000/auth";

// Gửi email để tạo OTP
export const createOtp = async (email: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post(`${API_URL}/create-otp`, { email });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Response error:", error.response.data);
    } else if (error.request) {
      console.error("❌ No response received:", error.request);
    }
    throw error;
  }
};

// Gửi OTP để nhận mật khẩu mới
export const sendPassword = async (
  email: string,
  otp: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post(`${API_URL}/send-password`, {
      email,
      otp,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Response error:", error.response.data);
    } else if (error.request) {
      console.error("❌ No response received:", error.request);
    }
    throw error;
  }
};
