import { Server } from 'socket.io';
import socketAuth from '../middlewares/socketAuth.js';
import { registerChatHandlers } from './chatSocket.js';
import { registerNotificationHandlers } from './notificationSocket.js';
import User from '../models/User.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const chat = io.of('/chat');
  chat.use(socketAuth);
  chat.on('connection', async (socket) => {
    // Chỉ update DB, KHÔNG emit gì cả
    await User.findByIdAndUpdate(socket.user.id, {
      isOnline: true,
      lastActive: new Date(),
    });

    registerChatHandlers(chat, socket);
  });

  const notifications = io.of('/notifications');
  notifications.use(socketAuth);
  notifications.on('connection', (socket) =>
    registerNotificationHandlers(notifications, socket)
  );

  return { chat, notifications };
};
