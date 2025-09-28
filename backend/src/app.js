// Core Node.js/Express dependencies
import express from 'express';
import http from 'http';
import cors from 'cors';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Middlewares and Socket handlers
import { initializeSocket } from './sockets/socket.js';
import { errorHandling } from './middlewares/errorHandling.js';

const app = express();
const server = http.createServer(app); // Tạo server HTTP từ app

const { chat, notifications } = initializeSocket(server);
app.set('chatIo', chat);
app.set('notificationIo', notifications);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use('/posts', postRoutes);
app.use('/categories', categoryRoutes);
app.use('/upload', uploadRoutes);
app.use('/messages', messageRoutes);
app.use('/conversations', conversationRoutes);
app.use('/friends', friendRoutes);
app.use('/notifications', notificationRoutes);

app.use(errorHandling);

// Xuất cả app và server
export { app, server };
