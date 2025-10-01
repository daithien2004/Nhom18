import { createContext, useContext, useEffect, useState } from 'react';
import { connectChatSocket } from './socket';
import type { Socket } from 'socket.io-client';
import { useAppSelector } from '../store/hooks';

const ChatSocketContext = createContext<Socket | null>(null);

export const ChatSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const token = useAppSelector((state) => state.auth.token);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = connectChatSocket(token);
    setSocket(s);

    return () => {
      // Chỉ xóa listener, để reconnection xử lý kết nối
      if (s) {
        s.off(); // Xóa tất cả listener để tránh rò rỉ bộ nhớ
      }
    };
  }, [token]);

  return (
    <ChatSocketContext.Provider value={socket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocket = () => useContext(ChatSocketContext);
