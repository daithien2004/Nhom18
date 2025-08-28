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
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};

// Thêm interface cho User Profile
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}
