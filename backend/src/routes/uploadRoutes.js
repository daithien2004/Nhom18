import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // lưu file tạm

// POST /upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Chưa có file nào' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'posts',
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Lỗi upload:', error);
    res.status(500).json({ error: 'Upload thất bại' });
  }
});

export default router;
