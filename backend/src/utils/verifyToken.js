import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET chưa được cấu hình');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token đã hết hạn');
    } else if (err.name === 'JsonWebTokenError') {
      throw new Error('Token không hợp lệ');
    } else {
      throw new Error('Lỗi xác thực token');
    }
  }
};
