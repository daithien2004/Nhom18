import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';
import * as statisticRepo from '../repositories/statisticRepository.js';
import * as userRepo from '../repositories/userRepository.js';

// Lấy thống kê tổng hợp của người dùng
export const getUserStatistics = async (userId) => {
  // Kiểm tra user có tồn tại không
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  try {
    const statistics = await statisticRepo.getUserStatistics(userId);
    return statistics;
  } catch (error) {
    console.error('Error in getUserStatistics:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Lỗi khi lấy thống kê'
    );
  }
};
