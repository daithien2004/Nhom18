import { createContext, useContext, useEffect, useState } from 'react';
import { connectNotificationSocket } from './socket';
import type { Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addNotification } from '../store/slices/notificationSlice';

const NotificationSocketContext = createContext<Socket | null>(null);

export const NotificationSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = connectNotificationSocket(token);
    setSocket(s);

    // Lắng nghe notification mới từ server → đẩy vào Redux
    s.on('notification', (notif) => {
      dispatch(addNotification(notif));
    });

    return () => {
      // Chỉ xóa listener, không ngắt kết nối ngay
      if (s) {
        s.off('notification'); // Xóa listener để tránh rò rỉ bộ nhớ
      }
    };
  }, [token]);

  return (
    <NotificationSocketContext.Provider value={socket}>
      {children}
    </NotificationSocketContext.Provider>
  );
};

// Hook tiện dụng để dùng trong component
export const useNotification = () => useContext(NotificationSocketContext);
