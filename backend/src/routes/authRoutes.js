import express from "express";
import {
  requestOtp,
  verifyOtp,
  createOtp,
  sendPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/request-otp", requestOtp);
router.post("/register/verify", verifyOtp);
router.post("/create-otp", createOtp);
router.post("/send-password", sendPassword);

export default router;
