import Post from '../models/post.js';
import Comment from '../models/comment.js';
import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';

export const createPostService = async ({ authorId, content, images }) => {
  if (!content && (!images || images.length === 0)) {
    throw new Error('Bài đăng phải có nội dung hoặc ít nhất một hình ảnh.');
  }

  return await Post.create({ author: authorId, content, images });
};

export const getPostsService = async ({ type, limit }) => {
  let posts;
  const l = limit ? parseInt(limit) : 20;

  try {
    switch (type) {
      case 'recent':
        posts = await Post.find()
          .populate('author', 'username avatar')
          .populate({
            path: 'comments',
            populate: { path: 'author', select: 'username avatar' },
            options: { strictPopulate: false }, // an toàn nếu comment rỗng
          })
          .sort({ createdAt: -1 })
          .limit(l);
        break;

      case 'hot':
        posts = await Post.aggregate([
          {
            $addFields: {
              totalInteractions: {
                $add: [
                  { $size: { $ifNull: ['$likes', []] } },
                  { $size: { $ifNull: ['$comments', []] } },
                ],
              },
            },
          },
          { $sort: { totalInteractions: -1 } },
          { $limit: l },
        ]);
        posts = await Post.populate(posts, [
          { path: 'author', select: 'username avatar' },
          {
            path: 'comments',
            populate: { path: 'author', select: 'username avatar' },
            options: { strictPopulate: false },
          },
        ]);
        break;

      case 'popular':
        posts = await Post.find()
          .populate('author', 'username avatar')
          .populate({
            path: 'comments',
            populate: { path: 'author', select: 'username avatar' },
            options: { strictPopulate: false },
          })
          .sort({ views: -1 })
          .limit(l);
        break;

      case 'pinned':
        // "Đáng chú ý": bài viết gần đây có tương tác cao
        // Tiêu chí: trong 7 ngày gần nhất, điểm = likes*3 + comments*5 + views
        {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const agg = await Post.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
              $addFields: {
                likesCount: { $size: { $ifNull: ['$likes', []] } },
                commentsCount: { $size: { $ifNull: ['$comments', []] } },
              },
            },
            {
              $addFields: {
                score: {
                  $add: [
                    { $multiply: ['$likesCount', 3] },
                    { $multiply: ['$commentsCount', 5] },
                    { $ifNull: ['$views', 0] },
                  ],
                },
              },
            },
            { $sort: { score: -1, createdAt: -1 } },
            { $limit: l },
          ]);

          posts = await Post.populate(agg, [
            { path: 'author', select: 'username avatar' },
            {
              path: 'comments',
              populate: { path: 'author', select: 'username avatar' },
              options: { strictPopulate: false },
            },
          ]);
        }
        break;

      default:
        posts = await Post.find()
          .populate('author', 'username avatar')
          .populate({
            path: 'comments',
            populate: { path: 'author', select: 'username avatar' },
            options: { strictPopulate: false },
          })
          .sort({ createdAt: -1 })
          .limit(l);
    }

    return posts;
  } catch (err) {
    console.error('Error in getPostsService:', err);
    return []; // trả về mảng rỗng nếu có lỗi
  }
};

export const getPostDetailService = async (postId, userId) => {
  try {
    // Tăng lượt xem và trả về bản ghi mới nhất
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username avatar isOnline')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatar' },
      })
      .lean();

    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
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
    throw new ApiError(500, 'Lỗi! Không lấy được chi tiết bài Post');
  }
};

export const toggleLikePostService = async (postId, userId) => {
  const post = await Post.findById(postId);
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

  return {
    postId: post._id.toString(),
    isLiked,
    likeCount: post.likes.length,
  };
};

export const createCommentService = async ({ postId, userId, content }) => {
  if (!content || !content.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nội dung bình luận không được để trống');
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }

  const comment = await Comment.create({ postId, author: userId, content: content.trim() });
  post.comments.push(comment._id);
  await post.save();

  const populated = await Comment.findById(comment._id)
    .populate({ path: 'author', select: 'username avatar' })
    .lean();

  return populated;
};