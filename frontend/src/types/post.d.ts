export type PostDetail = {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  caption?: string; // người share viết thêm gì
  content?: string; // nội dung bài gốc
  images: string[];
  likes: string[];
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
  shares: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByCurrentUser: boolean;
  isSharedByCurrentUser: boolean;
  sharedFrom?: PostDetail | null; // <--- thêm để hỗ trợ bài share
};

export interface Post {
  _id: string;
  content?: string; // bài gốc mới có content, bài share có thể không có
  caption?: string; // caption khi share bài
  images: string[];
  author: {
    username: string;
    avatar: string;
  };
  likes: string[];
  comments: Comment[];
  shares: string[]; // danh sách id các post share
  views: number;
  sharedFrom?: Post | null; // bài gốc nếu đây là bài share
  createdAt: string;
  updatedAt?: string;
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

export type Tab = "recent" | "hot" | "popular" | "pinned";
