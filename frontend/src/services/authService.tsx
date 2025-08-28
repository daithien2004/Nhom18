import instance from "../api/axiosInstant";
import type { LoginResponse } from "../types/LoginType";

// Hàm trả về thẳng dữ liệu server, không có .data
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const URL_API = "/auth/login";
  const data = { email, password };

  const res = await instance.post<LoginResponse>(URL_API, data);
  return res.data;
};
