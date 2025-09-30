import * as statisticService from '../services/statisticService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// Lấy thống kê tổng hợp của người dùng
export const getUserStatistics = asyncHandler(async (req, res) => {
  const statistics = await statisticService.getUserStatistics(req.user.id);
  return sendSuccess(res, statistics, 'Lấy thông tin thống kê thành công');
});
