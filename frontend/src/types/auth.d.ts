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

export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};
