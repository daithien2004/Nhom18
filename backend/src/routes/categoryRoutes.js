import { Router } from 'express';
import {
  createCategory,
  getUserCategories,
  renameCategory,
  deleteCategory,
  savePostToCategory,
  removePostFromCategory,
} from '../controllers/postCategoryController.js';
import auth from '../middlewares/auth.js';
import { validateBody, validateParams } from '../middlewares/validation.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  addPostToCategorySchema,
} from '../schemas/categorySchemas.js';

const router = Router();

// Lấy danh sách danh mục của user (cần đăng nhập)
router.get('/', auth, getUserCategories);

// Tạo danh mục (cần đăng nhập)
router.post('/', validateBody(createCategorySchema), auth, createCategory);

// Đổi tên danh mục
router.patch(
  '/:categoryId',
  validateParams(categoryIdSchema),
  validateBody(updateCategorySchema),
  auth,
  renameCategory
);

// Xóa danh mục
router.delete(
  '/:categoryId',
  validateParams(categoryIdSchema),
  auth,
  deleteCategory
);

// Lưu bài viết vào danh mục
router.post(
  '/:categoryId/posts',
  validateParams(categoryIdSchema),
  validateBody(addPostToCategorySchema),
  auth,
  savePostToCategory
);

// Xóa bài viết khỏi danh mục
router.delete(
  '/:categoryId/posts/:postId',
  validateParams(categoryIdSchema.merge(addPostToCategorySchema)),
  auth,
  removePostFromCategory
);

export default router;
