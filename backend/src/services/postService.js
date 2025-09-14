import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';
import * as postRepo from '../repositories/postRepository.js';
import * as commentRepo from '../repositories/commentRepository.js';

export const createPost = async ({ authorId, content, images }) => {
  return await postRepo.createPost({ author: authorId, content, images });
};

export const getPosts = async ({ type, limit }) => {
  const l = limit ? parseInt(limit) : 20;
  try {
    switch (type) {
      case 'recent':
        return await postRepo.findRecentPosts(l);
      case 'hot':
        return await postRepo.findHotPosts(l);
      case 'popular':
        return await postRepo.findPopularPosts(l);
      default:
        return await postRepo.findRecentPosts(l);
    }
  } catch (err) {
    console.error('Error in getPosts:', err);
    return [];
  }
};

export const getPostDetail = async (postId, userId) => {
  const post = await postRepo.findPostAndIncreaseView(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }

  post.likes = post.likes || [];
  post.comments = post.comments || [];
  post.shares = post.shares || [];

  post.likeCount = post.likes.length;
  post.commentCount = post.comments.length;
  post.shareCount = post.shares.length;

  post.isLikedByCurrentUser = post.likes.some((id) => id.toString() === userId);
  post.isSharedByCurrentUser = post.shares.some(
    (id) => id.toString() === userId
  );

  return post;
};

export const toggleLikePost = async (postId, userId) => {
  const post = await postRepo.findPostById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
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
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
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
