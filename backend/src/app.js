import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import friendRoutes from './routes/friendRouter.js';
import { Server } from 'socket.io';
import { registerMessageHandlers } from './sockets/messageSocket.js';
import http from 'http';
import socketAuth from './middlewares/socketAuth.js';

const app = express();
const server = http.createServer(app); // Tạo server HTTP từ app
const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép tất cả origin, thay đổi theo frontend URL nếu cần
    methods: ['GET', 'POST'],
  },
});

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

app.set('io', io);

// Middleware xác thực token
io.use(socketAuth);

// Xử lý Socket.io cho nhắn tin
io.on('connection', (socket) => {
  registerMessageHandlers(io, socket);
});

// Xuất cả app và server
export { app, server };
