export type PostDetail = {
  id: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  caption?: string; // người share viết thêm gì
  content?: string; // nội dung bài gốc
  images: string[];
  likes: { userId: string; username: string; avatar: string }[];
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
  shares: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByCurrentUser: boolean;
  sharedFrom?: PostDetail | null; // <--- thêm để hỗ trợ bài share
};

export interface Post {
  id: string;
  content?: string; // bài gốc mới có content, bài share có thể không có
  caption?: string; // caption khi share bài
  isLikedByCurrentUser: boolean;
  likeCount: number;
  commentCount: number;
  images: string[];
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  likes: { userId: string; username: string; avatar: string }[];
  comments: Comment[];
  shares: string[]; // danh sách id các post share
  views: number;
  sharedFrom?: Post | null; // bài gốc nếu đây là bài share
  createdAt: string;
  updatedAt?: string;
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
