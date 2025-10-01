import { ChatUser } from '../pages/FriendsPage';

export interface ChatUser {
  id: string;
  username: string;
  avatar?: string;
  status: 'active' | 'pending' | 'none';
  isOnline?: boolean;
}

export interface Message {
  id: string;
  sender: {
    id: string | undefined;
    username?: string | undefined;
    avatar?: string | undefined;
  };
  conversationId: string | null;
  text?: string;
  attachments?: string[];
  reactions: { [userId: string]: string };
  readBy: string[];
  status: 'sent' | 'delivered' | 'seen';
  createdAt?: string;
}

export interface Conversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: Message | null;
  settings: {
    theme: string; // e.g., 'bg-gray-50'
    customEmoji: string; // e.g., '👍'
    notificationsEnabled: boolean;
  };
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  updatedAt?: string;
  status: 'active' | 'pending' | 'none';
}
