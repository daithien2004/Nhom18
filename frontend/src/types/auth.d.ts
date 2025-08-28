export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone: string;
  otp?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
