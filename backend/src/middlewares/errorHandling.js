import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response.js';

// Middleware xử lý lỗi tập trung trong ứng dụng Back-end NodeJS (ExpressJS)
export const errorHandling = (err, req, res, next) => {
  // Nếu dev không cẩn thận thiếu statusCode thì mặc định sẽ để code 500 INTERNAL_SERVER_ERROR
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  // Lấy message từ error hoặc sử dụng message mặc định theo status code
  const message = err.message || StatusCodes[err.statusCode];

  // Log error trong development
  if (process.env.NODE_ENV === 'development') {
    console.error({
      statusCode: err.statusCode,
      message: message,
      stack: err.stack,
    });
  }

  // Sử dụng sendError để trả về response nhất quán
  return sendError(res, message, err.statusCode, err);
};
