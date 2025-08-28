import express from "express";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import userRouter from './routes/userRoutes.js';
import auth from './middlewares/auth.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use('/user', auth, userRouter);

export default app;
