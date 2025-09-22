import dotenv from 'dotenv';
import { app, server } from './app.js'; // Nhập cả app và server
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Backend Node.js is running on port: ${PORT}`);
  console.log('Cloudinary ENV:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Loaded' : 'Missing',
  });
});
