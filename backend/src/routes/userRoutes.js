import express from "express";
import {
  getProfile,
  handleUpdateProfile,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Thêm route để lấy profile user hiện tại
router.get("/me", auth, getProfile);
router.post("/update-profile", auth, handleUpdateProfile);
export default router;
