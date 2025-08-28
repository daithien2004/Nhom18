import express from "express";
import {
  requestOtp,
  verifyOtp,
  userLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json("Hello world!");
});

router.post("/register/request-otp", requestOtp);
router.post("/register/verify", verifyOtp);
router.post("/login", userLogin);

export default router;
