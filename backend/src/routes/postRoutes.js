import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostDetail,
  toggleLikePost,
  createComment,
} from "../controllers/postController.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Lấy danh sách bài viết (feed)
router.get("/", getPosts);

// Lấy chi tiết 1 bài viết
router.get("/:postId", auth, getPostDetail);

// Tạo bài viết (cần đăng nhập)
router.post("/", auth, createPost);

// Like/Unlike bài viết
router.post("/:postId/like", auth, toggleLikePost);

// Tạo bình luận cho bài viết
router.post("/:postId/comments", auth, createComment);

export default router;
