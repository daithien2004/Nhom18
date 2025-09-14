export interface Message {
  _id: string;
  conversationId: string;
  sender: UserType;
  text?: string;
  attachments?: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: UserType[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}
