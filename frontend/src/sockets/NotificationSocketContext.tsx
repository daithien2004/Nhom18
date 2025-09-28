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
      s.disconnect();
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
