import express from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  getFriends,
  getFriendRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import multer from "multer";
import { validateBody, validateQuery } from "../middlewares/validation.js";
import { updateUserSchema } from "../schemas/authSchemas.js";
import {
  searchUserSchema,
  sendFriendRequestSchema,
  respondFriendRequestSchema,
} from "../schemas/friendSchemas.js";

const router = express.Router();

// RESTful user routes
router.get("/me", auth, getProfile);
router.put("/me", validateBody(updateUserSchema), auth, updateProfile);

// multer lưu file tạm vào uploads/
const upload = multer({ dest: "uploads/" });

router.put("/me/avatar", auth, upload.single("avatar"), updateAvatar);
router.put("/me/cover", auth, upload.single("coverPhoto"), updateCoverPhoto);

// Danh sách bạn bè
router.get("/friends", auth, getFriends);

// Danh sách lời mời
router.get("/friend-requests", auth, getFriendRequests);

// Tìm kiếm
router.get("/search", auth, validateQuery(searchUserSchema), searchUsers);

// Gửi lời mời
router.post(
  "/send-request",
  auth,
  validateBody(sendFriendRequestSchema),
  sendFriendRequest
);

// Chấp nhận
router.post(
  "/accept-request",
  auth,
  validateBody(respondFriendRequestSchema),
  acceptFriendRequest
);

// Từ chối
router.post(
  "/reject-request",
  auth,
  validateBody(respondFriendRequestSchema),
  rejectFriendRequest
);

export default router;
