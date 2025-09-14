export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone: string;
  otp?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};
