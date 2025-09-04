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
  comments: string[]; // mảng ObjectId comment dạng string
  views: number;
  isPinned: boolean;
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
