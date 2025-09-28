import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import * as statisticRepo from "../repositories/statisticRepository.js";
import * as userRepo from "../repositories/userRepository.js";

// Lấy thống kê tổng hợp của người dùng
export const getUserStatistics = async (userId) => {
  // Kiểm tra user có tồn tại không
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const statistics = await statisticRepo.getUserStatistics(userId);
    return {
      success: true,
      data: statistics,
      message: "Lấy thống kê thành công",
    };
  } catch (error) {
    console.error("Error in getUserStatistics:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy thống kê"
    );
  }
};

// Lấy tổng lượt thích của người dùng
export const getTotalLikes = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const totalLikes = await statisticRepo.getTotalLikesByUserId(userId);
    return {
      success: true,
      data: { totalLikes },
      message: "Lấy tổng lượt thích thành công",
    };
  } catch (error) {
    console.error("Error in getTotalLikes:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy tổng lượt thích"
    );
  }
};

// Lấy tổng lượt bình luận của người dùng
export const getTotalComments = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const totalComments = await statisticRepo.getTotalCommentsByUserId(userId);
    return {
      success: true,
      data: { totalComments },
      message: "Lấy tổng lượt bình luận thành công",
    };
  } catch (error) {
    console.error("Error in getTotalComments:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy tổng lượt bình luận"
    );
  }
};

// Lấy tổng số bạn bè của người dùng
export const getTotalFriends = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const totalFriends = await statisticRepo.getTotalFriendsByUserId(userId);
    return {
      success: true,
      data: { totalFriends },
      message: "Lấy tổng số bạn bè thành công",
    };
  } catch (error) {
    console.error("Error in getTotalFriends:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy tổng số bạn bè"
    );
  }
};

// Lấy tổng số bài đăng của người dùng
export const getTotalPosts = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const totalPosts = await statisticRepo.getTotalPostsByUserId(userId);
    return {
      success: true,
      data: { totalPosts },
      message: "Lấy tổng số bài đăng thành công",
    };
  } catch (error) {
    console.error("Error in getTotalPosts:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy tổng số bài đăng"
    );
  }
};

// Lấy danh sách lượt thích theo từng bài viết
export const getLikesByPost = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const likesByPost = await statisticRepo.getLikesByPostForUserId(userId);
    return {
      success: true,
      data: { likesByPost },
      message: "Lấy danh sách lượt thích theo bài viết thành công",
    };
  } catch (error) {
    console.error("Error in getLikesByPost:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy danh sách lượt thích"
    );
  }
};

// Lấy thống kê lượt thích chi tiết cho từng bài viết
export const getDetailedLikesByPost = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    const detailedLikes = await statisticRepo.getDetailedLikesByPostForUserId(
      userId
    );
    return {
      success: true,
      data: { detailedLikes },
      message: "Lấy thống kê lượt thích chi tiết thành công",
    };
  } catch (error) {
    console.error("Error in getDetailedLikesByPost:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy thống kê lượt thích chi tiết"
    );
  }
};

// Lấy thống kê theo loại (likes, comments, friends)
export const getStatisticsByType = async (userId, type) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  try {
    let data = {};
    let message = "";

    switch (type) {
      case "likes":
        data.totalLikes = await statisticRepo.getTotalLikesByUserId(userId);
        message = "Lấy thống kê lượt thích thành công";
        break;
      case "comments":
        data.totalComments = await statisticRepo.getTotalCommentsByUserId(
          userId
        );
        message = "Lấy thống kê bình luận thành công";
        break;
      case "friends":
        data.totalFriends = await statisticRepo.getTotalFriendsByUserId(userId);
        message = "Lấy thống kê bạn bè thành công";
        break;
      case "posts":
        data.totalPosts = await statisticRepo.getTotalPostsByUserId(userId);
        message = "Lấy thống kê bài đăng thành công";
        break;
      default:
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Loại thống kê không hợp lệ"
        );
    }

    return {
      success: true,
      data,
      message,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Error in getStatisticsByType:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy thống kê"
    );
  }
};
