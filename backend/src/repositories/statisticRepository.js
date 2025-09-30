import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getTotalViewsInUserPosts = async (userId) => {
  const result = await Post.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(userId) } },
    { $project: { viewsSafe: { $ifNull: ['$views', 0] } } },
    { $group: { _id: null, totalViews: { $sum: '$viewsSafe' } } },
  ]);

  return result.length > 0 ? result[0].totalViews : 0;
};

// Lấy tổng số bạn bè của người dùng
export const getTotalFriendsByUserId = async (userId) => {
  const user = await User.findById(userId).select('friends');
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
    .select('_id content likes createdAt')
    .populate('likes', 'username avatar')
    .sort({ createdAt: -1 });

  return posts.map((post) => ({
    postId: post.id,
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

  return {
    totalLikes,
    totalViews, // Thay đổi từ totalComments thành totalViews
    totalFriends,
    totalPosts,
    likesByPost,
  };
};
