import express from "express";
import {
  login,
  registerRequestOtp,
  registerVerifyOtp,
  forgotPasswordRequestOtp,
  forgotPasswordReset,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/login", login);

// Register flow
router.post("/register/request-otp", registerRequestOtp);
router.post("/register/verify-otp", registerVerifyOtp);

// Forgot password flow
router.post("/forgot-password/request-otp", forgotPasswordRequestOtp);
router.post("/forgot-password/reset", forgotPasswordReset);

export default router;
