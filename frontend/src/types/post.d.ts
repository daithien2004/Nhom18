export type PostDetail = {
  id: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  content: string;
  images: string[];
  likes: string[]; // mảng ObjectId user dạng string
  comments: Array<{
    id: string;
    content: string;
    author: {
      username: string;
      avatar: string;
    };
    createdAt: string;
  }>;
  views: number;
  shares: string[]; // mảng ObjectId user dạng string
  createdAt: string;
  updatedAt: string;
  __v: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByCurrentUser: boolean;
  isSharedByCurrentUser: boolean;
};

export interface Post {
  id: string;
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
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

export type Tab = 'recent' | 'hot' | 'popular' | 'pinned';
