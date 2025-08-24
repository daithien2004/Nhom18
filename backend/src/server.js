import dotenv from 'dotenv';
import express, { json, urlencoded } from 'express';
import connectDB from './config/db.js';

dotenv.config();
const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

connectDB();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Backend Nodejs is runing on the port:' + port);
});
