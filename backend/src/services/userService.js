import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { comparePassword } from "./passwordService.js";
import dotenv from "dotenv";

dotenv.config();

export const handleLogin = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    return null;
  }

  const isMatchPassword = await comparePassword(password, user.password);
  if (!isMatchPassword) {
    return null;
  }

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return {
    accessToken: access_token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  };
};
