import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
} from '../controllers/postController.js';
import auth from '../middlewares/auth.js';

const router = Router();

// Lấy danh sách bài viết (feed)
router.get('/', getPosts);

// Lấy chi tiết 1 bài viết
router.get('/:id', getPostById);

// Tạo bài viết (cần đăng nhập)
router.post('/', auth, createPost);

export default router;
