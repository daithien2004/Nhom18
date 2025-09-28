import { Router } from "express";
import {
  getUserStatistics,
  getTotalLikes,
  getTotalComments,
  getTotalFriends,
  getTotalPosts,
  getLikesByPost,
  getDetailedLikesByPost,
  getStatisticsByType,
  getOtherUserStatistics,
  getOtherUserLikes,
  getOtherUserDetailedLikes,
} from "../controllers/statisticController.js";
import auth from "../middlewares/auth.js";
import { validateParams } from "../middlewares/validation.js";
import { userIdSchema, statisticTypeSchema } from "../schemas/authSchemas.js";

const router = Router();

// Routes cho thống kê của chính mình (cần đăng nhập)
router.get("/", auth, getUserStatistics);
router.get("/likes", auth, getTotalLikes);
router.get("/comments", auth, getTotalComments);
router.get("/friends", auth, getTotalFriends);
router.get("/posts", auth, getTotalPosts);
router.get("/likes-by-post", auth, getLikesByPost);
router.get("/detailed-likes", auth, getDetailedLikesByPost);
router.get(
  "/type/:type",
  validateParams(statisticTypeSchema),
  auth,
  getStatisticsByType
);

// Routes cho thống kê của người dùng khác (có thể public hoặc cần đăng nhập)
router.get(
  "/users/:userId",
  validateParams(userIdSchema),
  auth,
  getOtherUserStatistics
);
router.get(
  "/users/:userId/likes",
  validateParams(userIdSchema),
  auth,
  getOtherUserLikes
);
router.get(
  "/users/:userId/detailed-likes",
  validateParams(userIdSchema),
  auth,
  getOtherUserDetailedLikes
);

export default router;
