import express from "express";
import {
  login,
  registerRequestOtp,
  registerVerifyOtp,
  forgotPasswordRequestOtp,
  forgotPasswordReset,
} from "../controllers/authController.js";
import { validateBody } from "../middlewares/validation.js";
import {
  loginSchema,
  registerRequestOtpSchema,
  registerVerifyOtpSchema,
  forgotPasswordRequestOtpSchema,
  forgotPasswordResetSchema,
} from "../schemas/authSchemas.js";

const router = express.Router();

// Auth routes
router.post("/login", validateBody(loginSchema), login);

// Register flow
router.post("/register/request-otp", validateBody(registerRequestOtpSchema), registerRequestOtp);
router.post("/register/verify-otp", validateBody(registerVerifyOtpSchema), registerVerifyOtp);

// Forgot password flow
router.post("/forgot-password/request-otp", validateBody(forgotPasswordRequestOtpSchema), forgotPasswordRequestOtp);
router.post("/forgot-password/reset", validateBody(forgotPasswordResetSchema), forgotPasswordReset);

export default router;
