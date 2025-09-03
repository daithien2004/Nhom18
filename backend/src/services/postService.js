import Post from '../models/post.js';
import Comment from '../models/comment.js';

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
        posts = await Post.find({ isPinned: true })
          .populate('author', 'username avatar')
          .populate({
            path: 'comments',
            populate: { path: 'author', select: 'username avatar' },
            options: { strictPopulate: false },
          })
          .sort({ createdAt: -1 })
          .limit(l);
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

export const getPostByIdService = async (postId) => {
  const post = await Post.findById(postId)
    .populate('author', 'username avatar')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'username avatar' },
    });

  if (!post) throw new Error('Không tìm thấy bài viết');
  return post;
};
