import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import * as postRepo from "../repositories/postRepository.js";
import * as commentRepo from "../repositories/commentRepository.js";

export const createPost = async ({ authorId, content, images }) => {
  return await postRepo.createPost({ author: authorId, content, images });
};

export const getPosts = async ({ type, limit, page = 1 }) => {
  const l = limit ? parseInt(limit) : 20;
  const p = page ? parseInt(page) : 1;
  const skip = (p - 1) * l;
  try {
    switch (type) {
      case "recent":
        return await postRepo.findRecentPosts(l, skip);
      case "hot":
        return await postRepo.findHotPosts(l, skip);
      case "popular":
        return await postRepo.findPopularPosts(l, skip);
      default:
        return await postRepo.findRecentPosts(l, skip);
    }
  } catch (err) {
    console.error("Error in getPosts:", err);
    return [];
  }
};

export const getPostDetail = async (postId, userId) => {
  const post = await postRepo.findPostAndIncreaseView(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy bài Post");
  }

  // Đảm bảo các mảng luôn tồn tại
  post.likes = post.likes || [];
  post.comments = post.comments || [];
  post.shares = post.shares || [];

  // Thêm thống kê
  post.likeCount = post.likes.length;
  post.commentCount = post.comments.length;
  post.shareCount = post.shares.length;

  // Trạng thái người dùng hiện tại
  post.isLikedByCurrentUser = post.likes.some((id) => id.toString() === userId);
  post.isSharedByCurrentUser = post.shares.some(
    (id) => id.toString() === userId
  );

  // Nếu là bài share thì cũng normalize sharedFrom
  if (post.sharedFrom) {
    post.sharedFrom.likes = post.sharedFrom.likes || [];
    post.sharedFrom.comments = post.sharedFrom.comments || [];
    post.sharedFrom.shares = post.sharedFrom.shares || [];

    post.sharedFrom.likeCount = post.sharedFrom.likes.length;
    post.sharedFrom.commentCount = post.sharedFrom.comments.length;
    post.sharedFrom.shareCount = post.sharedFrom.shares.length;

    post.sharedFrom.isLikedByCurrentUser = post.sharedFrom.likes.some(
      (id) => id.toString() === userId
    );
    post.sharedFrom.isSharedByCurrentUser = post.sharedFrom.shares.some(
      (id) => id.toString() === userId
    );
  }

  return post;
};

export const toggleLikePost = async (postId, userId) => {
  const post = await postRepo.findPostById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy bài Post");
  }

  const likedIndex = post.likes.findIndex((id) => id.toString() === userId);
  let isLiked;
  if (likedIndex >= 0) {
    post.likes.splice(likedIndex, 1);
    isLiked = false;
  } else {
    post.likes.push(userId);
    isLiked = true;
  }

  await post.save();
  return { postId: post._id.toString(), isLiked, likeCount: post.likes.length };
};

export const createComment = async ({ postId, userId, content }) => {
  const post = await postRepo.findPostById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy bài Post");
  }

  const comment = await commentRepo.createComment({
    postId,
    author: userId,
    content: content.trim(),
  });

  post.comments.push(comment._id);
  await post.save();

  return await commentRepo.findCommentById(comment._id);
};

export const sharePost = async ({ userId, postId, caption }) => {
  let original = await postRepo.findPostById(postId);
  if (!original) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy bài Post");
  }

  // nếu post hiện tại là bài share thì truy ngược về bài gốc
  if (original.sharedFrom) {
    original = await postRepo.findPostById(original.sharedFrom);
  }

  // tạo post share
  const shared = await postRepo.createPostShare({
    author: userId,
    caption: caption || "",
    sharedFrom: original._id,
  });

  // thêm vào danh sách share của bài gốc
  if (!original.shares.some((id) => id.toString() === shared._id.toString())) {
    original.shares.push(shared._id);
    await original.save();
  }

  return await postRepo.findPostDetail(shared._id, {
    populate: [
      { path: "author", select: "username avatar" },
      {
        path: "sharedFrom",
        populate: { path: "author", select: "username avatar" },
      },
    ],
  });
};
