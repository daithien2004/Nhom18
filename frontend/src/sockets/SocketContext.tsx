import { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket } from './socket';
import type { Socket } from 'socket.io-client';
import { getToken } from '../utils/authHelpers';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
