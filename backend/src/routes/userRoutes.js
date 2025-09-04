import express from "express";
import {
  getProfile,
  handleUpdateProfile,
  updateAvatar,
  updateCoverPhoto,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();

// Thêm route để lấy profile user hiện tại
router.get("/me", auth, getProfile);
router.post("/update-profile", auth, handleUpdateProfile);
// multer lưu file tạm vào uploads/
const upload = multer({ dest: "uploads/" });

router.post("/update-avatar", auth, upload.single("avatar"), updateAvatar);
router.post(
  "/update-cover",
  auth,
  upload.single("coverPhoto"),
  updateCoverPhoto
);

export default router;
