import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use('/posts', postRoutes);
app.use('/upload', uploadRoutes);

export default app;
