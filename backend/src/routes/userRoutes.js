import express from "express";
import auth from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/home", (req, res) => {
  res.status(200).json("Trang chủ user");
});

userRouter.get("/profile", (req, res) => {
  res.status(200).json("Trang profile");
});

export default userRouter;
