import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const auth = (req, res, next) => {
  // Kiểm tra authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: 'Token không được cung cấp',
    });
  }

  // Kiểm tra format của token (Bearer <token>)
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      message: 'Format token không hợp lệ',
    });
  }

  const token = parts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Thêm thông tin user vào request để sử dụng ở các middleware tiếp theo
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token đã hết hạn',
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token không hợp lệ',
      });
    } else {
      return res.status(401).json({
        message: 'Lỗi xác thực token',
      });
    }
  }
};

export default auth;
