import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostDetail,
  toggleLikePost,
  createComment,
  sharePost,
  getUserPosts,
  deletePost,
  updatePost,
  deleteComment,
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
  myPostQuerySchema,
} from '../schemas/postSchemas.js';

const router = Router();

// Lấy danh sách bài viết (feed)
router.get('/', optionalAuth, validateQuery(postQuerySchema), getPosts);

// Lấy danh sách bài viết của người dùng, bao gồm cả post tạo lẫn share
router.get(
  '/user/:userId',
  validateQuery(myPostQuerySchema),
  auth,
  getUserPosts
);

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

router.delete(
  '/:postId/comments/:commentId',
  auth,
  validateParams(postIdSchema), // Có thể cần schema riêng cho commentId
  deleteComment
);

router.post(
  '/:postId/share',
  auth,
  validateParams(postIdSchema),
  validateBody(sharePostSchema),
  sharePost
);

// Cập nhật bài viết
router.put(
  '/:postId',
  auth,
  validateParams(postIdSchema),
  validateBody(createPostSchema),
  updatePost
);

// Xóa bài viết
router.delete('/:postId', auth, validateParams(postIdSchema), deletePost);

export default router;
