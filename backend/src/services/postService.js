import Post from "../models/post.js";
import Comment from "../models/comment.js";
import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";

export const createPostService = async ({ authorId, content, images }) => {
  if (!content && (!images || images.length === 0)) {
    throw new Error("Bài đăng phải có nội dung hoặc ít nhất một hình ảnh.");
  }

  return await Post.create({ author: authorId, content, images });
};

export const getPostsService = async ({ type, limit }) => {
  let posts;
  const l = limit ? parseInt(limit) : 20;

  try {
    switch (type) {
      case "recent":
        posts = await Post.find()
          .populate("author", "username avatar")
          .populate({
            path: "comments",
            populate: { path: "author", select: "username avatar" },
            options: { strictPopulate: false }, // an toàn nếu comment rỗng
          })
          .sort({ createdAt: -1 })
          .limit(l);
        break;

      case "hot":
        posts = await Post.aggregate([
          {
            $addFields: {
              totalInteractions: {
                $add: [
                  { $size: { $ifNull: ["$likes", []] } },
                  { $size: { $ifNull: ["$comments", []] } },
                ],
              },
            },
          },
          { $sort: { totalInteractions: -1 } },
          { $limit: l },
        ]);
        posts = await Post.populate(posts, [
          { path: "author", select: "username avatar" },
          {
            path: "comments",
            populate: { path: "author", select: "username avatar" },
            options: { strictPopulate: false },
          },
        ]);
        break;

      case "popular":
        posts = await Post.find()
          .populate("author", "username avatar")
          .populate({
            path: "comments",
            populate: { path: "author", select: "username avatar" },
            options: { strictPopulate: false },
          })
          .sort({ views: -1 })
          .limit(l);
        break;

      case "pinned":
        posts = await Post.find({ isPinned: true })
          .populate("author", "username avatar")
          .populate({
            path: "comments",
            populate: { path: "author", select: "username avatar" },
            options: { strictPopulate: false },
          })
          .sort({ createdAt: -1 })
          .limit(l);
        break;

      default:
        posts = await Post.find()
          .populate("author", "username avatar")
          .populate({
            path: "comments",
            populate: { path: "author", select: "username avatar" },
            options: { strictPopulate: false },
          })
          .sort({ createdAt: -1 })
          .limit(l);
    }

    return posts;
  } catch (err) {
    console.error("Error in getPostsService:", err);
    return []; // trả về mảng rỗng nếu có lỗi
  }
};

export const getPostDetailService = async (postId, userId) => {
  try {
    // Tìm post và populate thông tin cần thiết
    const post = await Post.findById(postId)
      .populate("author", "username avatar isOnline") // lấy thông tin cơ bản của tác giả
      .populate({
        path: "comments",
        populate: { path: "author", select: "username avatar" }, // lấy thêm thông tin tác giả comment
      })
      .lean(); // trả về plain object

    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy bài Post");
    }

    // Đảm bảo các mảng tồn tại
    post.likes = post.likes || [];
    post.comments = post.comments || [];
    post.shares = post.shares || [];

    // Thêm dữ liệu bổ sung
    post.likeCount = post.likes.length;
    post.commentCount = post.comments.length;
    post.shareCount = post.shares.length;

    post.isLikedByCurrentUser = post.likes.some(
      (id) => id.toString() === userId
    );

    post.isSharedByCurrentUser = post.shares.some(
      (id) => id.toString() === userId
    );

    return post;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500 || "Lỗi! Không lấy được chi tiết bài Post");
  }
};
