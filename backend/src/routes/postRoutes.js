import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostDetail,
  toggleLikePost,
  createComment,
  sharePost,
} from '../controllers/postController.js';
import auth from '../middlewares/auth.js';
import optionalAuth from '../middlewares/optionalAuth.js';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middlewares/validation.js';
import {
  createPostSchema,
  createCommentSchema,
  postQuerySchema,
  postIdSchema,
  sharePostSchema,
} from '../schemas/postSchemas.js';

const router = Router();

// Lấy danh sách bài viết (feed)
router.get('/', optionalAuth, validateQuery(postQuerySchema), getPosts);

// Lấy chi tiết 1 bài viết
router.get('/:postId', validateParams(postIdSchema), auth, getPostDetail);

// Tạo bài viết (cần đăng nhập)
router.post('/', validateBody(createPostSchema), auth, createPost);

// Like/Unlike bài viết
router.post(
  '/:postId/like',
  auth,
  validateParams(postIdSchema),
  toggleLikePost
);

// Tạo bình luận cho bài viết
router.post(
  '/:postId/comments',
  auth,
  validateParams(postIdSchema),
  validateBody(createCommentSchema),
  createComment
);

router.post(
  '/:postId/share',
  auth,
  validateParams(postIdSchema),
  validateBody(sharePostSchema),
  sharePost
);

export default router;
