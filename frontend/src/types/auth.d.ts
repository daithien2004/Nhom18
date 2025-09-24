export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export type LoginResponse = {
  accessToken: string;
  user: Pick<UserProfile, 'id' | 'email' | 'username'>;
};
