import { createContext, useContext, useEffect, useState } from 'react';
import { connectChatSocket } from './socket';
import type { Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addMessage,
  addMessageReaction,
  updateMessageStatus,
  updateSettings,
  type ConversationSettings,
} from '../store/slices/conversationSlice';
import type { Message } from '../types/message';

const ChatSocketContext = createContext<Socket | null>(null);

export const ChatSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const currentUser = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector(
    (state) => state.conversations.conversations
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  // Effect 1: Kết nối socket
  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = connectChatSocket(token);
    setSocket(s);

    return () => {
      if (s) {
        s.off(); // Xóa tất cả listener để tránh rò rỉ bộ nhớ
      }
    };
  }, [token]);

  // Effect 2: Đăng ký global event listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    console.log('🔌 Registering global chat event listeners');

    // Handler cho tin nhắn mới
    const handleSendMessage = (message: Message) => {
      console.log('📨 Received message:', message);

      dispatch(
        addMessage({
          conversationId: message.conversationId,
          message,
        })
      );

      // Tự động cập nhật status thành "delivered" nếu không phải tin nhắn của mình
      if (message.sender.id !== currentUser.id && message.status === 'sent') {
        dispatch(
          updateMessageStatus({
            conversationId: message.conversationId,
            messageId: message.id,
            status: 'delivered',
          })
        );
      }
    };

    // Handler cho cập nhật message status
    const handleMessageStatusUpdated = (data: {
      conversationId: string;
      messageId: string;
      status: string;
      readBy: string[];
    }) => {
      console.log('👁️ Message status updated:', data);

      dispatch({
        type: updateMessageStatus.fulfilled.type,
        payload: data,
      });
    };

    // Handler cho cập nhật settings
    const handleSettingsUpdated = (data: {
      conversationId: string;
      settings: ConversationSettings;
    }) => {
      console.log('⚙️ Settings updated:', data);

      dispatch(
        updateSettings({
          conversationId: data.conversationId,
          settings: data.settings,
        })
      );
    };

    // Handler cho thêm reaction
    const handleReactionAdded = (data: {
      conversationId: string;
      messageId: string;
      reaction: { [userId: string]: string };
    }) => {
      console.log('😊 Reaction added:', data);

      dispatch({
        type: addMessageReaction.fulfilled.type,
        payload: data,
      });
    };

    // Handler cho xóa reaction
    const handleReactionRemoved = (data: {
      conversationId: string;
      messageId: string;
      reaction: { [userId: string]: string };
      remove: boolean;
    }) => {
      console.log('😐 Reaction removed:', data);

      dispatch({
        type: addMessageReaction.fulfilled.type,
        payload: {
          conversationId: data.conversationId,
          messageId: data.messageId,
          reaction: data.reaction,
          remove: true,
        },
      });
    };

    // Đăng ký tất cả listeners
    socket.on('sendMessage', handleSendMessage);
    socket.on('messageStatusUpdated', handleMessageStatusUpdated);
    socket.on('settingsUpdated', handleSettingsUpdated);
    socket.on('reactionAdded', handleReactionAdded);
    socket.on('reactionRemoved', handleReactionRemoved);

    // Cleanup khi unmount hoặc socket/currentUser thay đổi
    return () => {
      console.log('🔌 Unregistering global chat event listeners');

      socket.off('sendMessage', handleSendMessage);
      socket.off('messageStatusUpdated', handleMessageStatusUpdated);
      socket.off('settingsUpdated', handleSettingsUpdated);
      socket.off('reactionAdded', handleReactionAdded);
      socket.off('reactionRemoved', handleReactionRemoved);
    };
  }, [socket, currentUser, dispatch]);

  useEffect(() => {
    if (!socket || !conversations || conversations.length === 0) return;

    console.log('🏠 Joining all conversation rooms...');
    conversations.forEach((conv) => {
      socket.emit('joinConversation', conv.id);
    });
  }, [socket, conversations]);

  return (
    <ChatSocketContext.Provider value={socket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocket = () => useContext(ChatSocketContext);
