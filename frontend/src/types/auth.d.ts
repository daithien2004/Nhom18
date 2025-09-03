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

export interface Post {
  _id: string;
  content: string;
  images: string[];
  author: {
    username: string;
    avatar: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
    avatar: string;
  };
  likes: string[];
  createdAt: string;
}

export type Tab = 'recent' | 'hot' | 'popular' | 'pinned';
