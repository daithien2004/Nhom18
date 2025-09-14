export type PostDetail = {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  content: string;
  images: string[];
  likes: string[]; // mảng ObjectId user dạng string
  comments: Array<{
    _id: string;
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
