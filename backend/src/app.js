<<<<<<< HEAD
import express from "express";
import authRoutes from "./routes/authRoutes.js";
=======
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
>>>>>>> main

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);

export default app;
