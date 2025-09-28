import { ChatSocketProvider } from './ChatSocketContext';
import { NotificationSocketProvider } from './NotificationSocketContext';

export const SocketProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ChatSocketProvider>
    <NotificationSocketProvider>{children}</NotificationSocketProvider>
  </ChatSocketProvider>
);
