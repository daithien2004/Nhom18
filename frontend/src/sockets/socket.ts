import { io, Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;
let notificationSocket: Socket | null = null;

// Kết nối namespace chat
export const connectChatSocket = (token: string) => {
  if (!chatSocket) {
    chatSocket = io(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
  }
  return chatSocket;
};

// Kết nối namespace notification
export const connectNotificationSocket = (token: string) => {
  if (!notificationSocket) {
    notificationSocket = io(
      `${import.meta.env.VITE_BACKEND_URL}/notifications`,
      {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
      }
    );
  }
  return notificationSocket;
};

// Getter
export const getChatSocket = () => chatSocket;
export const getNotificationSocket = () => notificationSocket;

// Disconnect
export const disconnectSockets = () => {
  chatSocket?.disconnect();
  notificationSocket?.disconnect();
  chatSocket = null;
  notificationSocket = null;
};
