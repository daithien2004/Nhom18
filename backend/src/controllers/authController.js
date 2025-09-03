import { handleLogin } from '../services/userService.js';
import { 
  requestRegistrationOtp, 
  verifyRegistrationOtp, 
  requestPasswordResetOtp, 
  resetPasswordWithOtp 
} from '../services/authService.js';

export const registerRequestOtp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await requestRegistrationOtp(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const registerVerifyOtp = async (req, res) => {
  try {
    const { username, email, otp, password, phone } = req.body;
    const result = await verifyRegistrationOtp(username, email, otp, password, phone);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPasswordRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordResetOtp(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPasswordReset = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await resetPasswordWithOtp(email, otp);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await handleLogin(email, password);
    if (!data) {
      return res.status(401).json({ error: 'Email hoặc password không đúng' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' });
  }
};
