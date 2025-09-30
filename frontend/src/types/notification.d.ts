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
  type: 'like' | 'comment' | 'follow' | 'share' | 'system';
  metadata: Record<string, any>;
  createdAt: string; // ISO date string
  updatedAt: string;
}
