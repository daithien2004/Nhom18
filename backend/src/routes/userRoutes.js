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

// RESTful user routes
router.get("/me", auth, getProfile);
router.put("/me", auth, handleUpdateProfile);

// multer lưu file tạm vào uploads/
const upload = multer({ dest: "uploads/" });

router.put("/me/avatar", auth, upload.single("avatar"), updateAvatar);
router.put("/me/cover", auth, upload.single("coverPhoto"), updateCoverPhoto);

export default router;
