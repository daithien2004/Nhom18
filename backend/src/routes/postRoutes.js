import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostDetail,
  toggleLikePost,
  createComment,
} from "../controllers/postController.js";
import auth from "../middlewares/auth.js";
import { validateBody, validateQuery, validateParams } from "../middlewares/validation.js";
import {
  createPostSchema,
  createCommentSchema,
  postQuerySchema,
  postIdSchema,
} from "../schemas/postSchemas.js";

const router = Router();

// Lấy danh sách bài viết (feed)
router.get("/", validateQuery(postQuerySchema), getPosts);

// Lấy chi tiết 1 bài viết
router.get("/:postId", validateParams(postIdSchema), auth, getPostDetail);

// Tạo bài viết (cần đăng nhập)
router.post("/", validateBody(createPostSchema), auth, createPost);

// Like/Unlike bài viết
router.post("/:postId/like", validateParams(postIdSchema), auth, toggleLikePost);

// Tạo bình luận cho bài viết
router.post("/:postId/comments", validateParams(postIdSchema), validateBody(createCommentSchema), auth, createComment);

export default router;
