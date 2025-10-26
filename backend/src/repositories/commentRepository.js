import Comment from '../models/Comment.js';

export const createComment = async ({ postId, author, content }) => {
  return await Comment.create({ postId, author, content });
};

export const findCommentById = async (id) => {
  return await Comment.findById(id).populate({
    path: 'author',
    select: 'username avatar',
  });
};

// Xóa tất cả comments của một bài viết
export const deleteCommentsByPostId = async (postId) => {
  return await Comment.deleteMany({ post: postId });
};

export const deleteComment = async (commentId) => {
  return await Comment.findByIdAndDelete(commentId);
};
