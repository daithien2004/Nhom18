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
  createdAt?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message | null;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  updatedAt?: string;
}
