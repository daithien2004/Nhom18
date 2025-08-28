import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

export const handleLogin = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (user) {
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return null;
    } else {
      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    }
  } else {
    return null;
  }
};
