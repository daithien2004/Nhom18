import bcrypt from "bcrypt";
import { User, Otp } from "../models/index.js";
import { sendOtpEmail } from "../services/emailService.js";
import { handleLogin } from "../services/userService.js";

export const requestOtp = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({ email, otp, expiresAt });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP đã gửi tới email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { username, email, otp, password, phone } = req.body;

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP không hợp lệ" });

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ username, email, password: hashedPassword, phone });

    await Otp.deleteMany({ email });

    res.json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await handleLogin(email, password);
    if (!data) {
      return res.status(401).json({ error: "Email hoặc password không đúng" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Lỗi server" });
  }
};
