import { Server } from 'socket.io';
import socketAuth from '../middlewares/socketAuth.js';
import { registerChatHandlers } from './chatSocket.js';
import { registerNotificationHandlers } from './notificationSocket.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const chat = io.of('/chat');
  chat.use(socketAuth);
  chat.on('connection', (socket) => registerChatHandlers(chat, socket));

  const notifications = io.of('/notifications');
  notifications.use(socketAuth);
  notifications.on('connection', (socket) =>
    registerNotificationHandlers(notifications, socket)
  );

  return { chat, notifications };
};
