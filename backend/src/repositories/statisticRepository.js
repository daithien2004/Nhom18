import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

// Lấy tổng lượt thích trong tất cả bài viết của người dùng
export const getTotalLikesByUserId = async (userId) => {
  console.log("Calculating total likes for userId:", userId);

  const result = await Post.aggregate([
    { $match: { author: userId } },
    { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
    { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
  ]);

  console.log("Aggregation result:", result);

  return result.length > 0 ? result[0].totalLikes : 0;
};

// Lấy tổng lượt bình luận của người dùng (bình luận mà user đã viết)
export const getTotalCommentsByUserId = async (userId) => {
  const result = await Comment.aggregate([
    { $match: { author: userId } },
    { $count: "totalComments" },
  ]);

  return result.length > 0 ? result[0].totalComments : 0;
};

// Lấy tổng số lượt xem trong tất cả bài viết của người dùng
// export const getTotalViewsInUserPosts = async (userId) => {
//   const result = await Post.aggregate([
//     { $match: { author: userId } },
//     { $group: { _id: null, totalViews: { $sum: "$views" } } },
//   ]);

//   return result.length > 0 ? result[0].totalViews : 0;
// };
import mongoose from "mongoose";

export const getTotalViewsInUserPosts = async (userId) => {
  const result = await Post.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(userId) } },
    { $project: { viewsSafe: { $ifNull: ["$views", 0] } } },
    { $group: { _id: null, totalViews: { $sum: "$viewsSafe" } } },
  ]);

  return result.length > 0 ? result[0].totalViews : 0;
};

// Lấy tổng số bạn bè của người dùng
export const getTotalFriendsByUserId = async (userId) => {
  const user = await User.findById(userId).select("friends");
  return user ? user.friends.length : 0;
};

// Lấy tổng số bài đăng của người dùng
export const getTotalPostsByUserId = async (userId) => {
  const result = await Post.countDocuments({ author: userId });
  return result;
};

// Lấy danh sách lượt thích theo từng bài viết của người dùng
export const getLikesByPostForUserId = async (userId) => {
  const posts = await Post.find({ author: userId })
    .select("_id content likes createdAt")
    .populate("likes", "username avatar")
    .sort({ createdAt: -1 });

  return posts.map((post) => ({
    postId: post._id,
    content: post.content,
    likesCount: post.likes.length,
    likes: post.likes,
    createdAt: post.createdAt,
  }));
};

// Lấy thống kê tổng hợp của người dùng
export const getUserStatistics = async (userId) => {
  const [totalViews, totalFriends, totalPosts, likesByPost] = await Promise.all(
    [
      getTotalViewsInUserPosts(userId), // Sử dụng function mới để đếm lượt xem trong bài viết
      getTotalFriendsByUserId(userId),
      getTotalPostsByUserId(userId),
      getLikesByPostForUserId(userId),
    ]
  );

  // Tính tổng lượt thích từ likesByPost
  const totalLikes = likesByPost.reduce(
    (sum, post) => sum + post.likesCount,
    0
  );

  console.log("Final statistics:", {
    totalLikes,
    totalViews,
    totalFriends,
    totalPosts,
    likesByPostCount: likesByPost.length,
  });

  return {
    totalLikes,
    totalViews, // Thay đổi từ totalComments thành totalViews
    totalFriends,
    totalPosts,
    likesByPost,
  };
};

// Lấy thống kê lượt thích chi tiết cho từng bài viết (với thông tin người like)
export const getDetailedLikesByPostForUserId = async (userId) => {
  const posts = await Post.find({ author: userId })
    .select("_id content likes createdAt")
    .populate({
      path: "likes",
      select: "username avatar isOnline",
      options: { sort: { createdAt: -1 } },
    })
    .sort({ createdAt: -1 });

  return posts.map((post) => ({
    postId: post._id,
    content: post.content,
    likesCount: post.likes.length,
    likes: post.likes.map((like) => ({
      userId: like._id,
      username: like.username,
      avatar: like.avatar,
      isOnline: like.isOnline,
    })),
    createdAt: post.createdAt,
  }));
};
