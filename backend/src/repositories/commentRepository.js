import Comment from '../models/Comment.js';

export const createComment = async ({ postId, author, content }) => {
  return await Comment.create({ postId, author, content });
};

export const findCommentById = async (id) => {
  return await Comment.findById(id)
    .populate({ path: 'author', select: 'username avatar' })
    .lean();
};
