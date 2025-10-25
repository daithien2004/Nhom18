export interface Notification {
  id: string; // _id từ MongoDB đã transform thành id
  senderId: {
    username: string;
    avatar: string;
  }; // id của user
  receiverId: {
    username: string;
    avatar: string;
  }; // id của user
  message: string;
  isRead: boolean;
  type:
    | 'like'
    | 'comment'
    | 'share'
    | 'friend_request'
    | 'friend_accept'
    | 'system';
  metadata: {
    postId?: string;
    postTitle?: string;
    postThumbnail?: string;
    comment?: string;
    reactionEmoji?: string;
    friendAction?: 'request' | 'accept';
    securityType?: 'suspicious_login' | 'password_change';
    [key: string]: any; // Linh hoạt cho các trường khác
  };
  createdAt: string; // ISO date string
  updatedAt: string;
}
