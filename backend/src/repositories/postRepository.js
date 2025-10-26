import Post from '../models/Post.js';

// Tạo post (hỗ trợ sharedFrom và images mặc định)
export const createPost = async ({ author, content, images = [] }) => {
  const post = await Post.create({ author, content, images });
  // Populate thông tin author và likes
  return await Post.populate(post, [
    { path: 'author', select: 'username avatar' },
    { path: 'likes', select: 'username avatar' },
  ]);
};

// Tạo post (hỗ trợ sharedFrom và images mặc định)
export const createPostShare = async ({
  author,
  caption,
  sharedFrom = null,
}) => {
  return await Post.create({ author, caption, sharedFrom });
};

const publicFilter = { isHidden: false, isDeleted: false };
const commentFilter = { isHidden: false, isDeleted: false };

export const findRecentPosts = async (limit, skip) => {
  return await Post.find(publicFilter)
    .populate([
      { path: 'author', select: '_id username avatar' },
      { path: 'likes', select: 'username avatar' },
      {
        path: 'comments',
        match: commentFilter,
        populate: { path: 'author', select: '_id username avatar' },
      },
      {
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: '_id username avatar' },
          { path: 'likes', select: 'username avatar' },
        ],
      },
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const findHotPosts = async (limit, skip) => {
  const agg = await Post.aggregate([
    { $match: publicFilter }, // Chỉ lấy bài công khai
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
    { $sort: { totalInteractions: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const populatedPosts = await Post.populate(agg, [
    { path: 'author', select: '_id username avatar' },
    { path: 'likes', select: 'username avatar' },
    {
      path: 'comments',
      match: commentFilter,
      populate: { path: 'author', select: '_id username avatar' },
    },
    {
      path: 'sharedFrom',
      populate: [
        { path: 'author', select: '_id username avatar' },
        { path: 'likes', select: 'username avatar' },
      ],
    },
  ]);

  // Chuyển đổi thành Mongoose documents
  return populatedPosts.map((post) => new Post(post));
};

export const findPopularPosts = async (limit, skip) => {
  return await Post.find(publicFilter)
    .populate([
      { path: 'author', select: '_id username avatar' },
      { path: 'likes', select: 'username avatar' },
      {
        path: 'comments',
        match: commentFilter,
        populate: { path: 'author', select: '_id username avatar' },
      },
      {
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: '_id username avatar' },
          { path: 'likes', select: 'username avatar' },
        ],
      },
    ])
    .sort({ views: -1 })
    .skip(skip)
    .limit(limit);
};

export const findPostById = async (id) => {
  return await Post.findById(id);
};

// repo/postRepo.ts
export const findPostAndIncreaseView = async (postId) => {
  return await Post.findByIdAndUpdate(
    postId,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', '_id username avatar isOnline')
    .populate('likes', 'username avatar') // populate likes của post
    .populate({
      path: 'sharedFrom',
      populate: [
        { path: 'author', select: '_id username avatar isOnline' },
        { path: 'likes', select: 'username avatar' },
      ],
    })
    .populate({
      path: 'comments',
      match: { isHidden: false, isDeleted: false },
      populate: { path: 'author', select: '_id username avatar' },
    });
};

export const findPost = async (postId) => {
  return await Post.findByIdAndUpdate(postId).populate(
    'author',
    '_id username avatar isOnline'
  );
};

export const findPostDetail = async (id, options = {}) => {
  let query = Post.findById(id);

  if (options.populate) {
    options.populate.forEach((p) => {
      query = query.populate(p);
    });
  }

  return await query;
};

export const findPostsByAuthor = async (authorId, limit, skip) => {
  return await Post.find({
    author: authorId,
    isDeleted: false,
    isHidden: false,
  })
    .populate([
      { path: 'author', select: '_id username avatar' },
      { path: 'likes', select: 'username avatar' },
      {
        path: 'comments',
        match: commentFilter,
        populate: { path: 'author', select: '_id username avatar' },
      },
      {
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: '_id username avatar' },
          { path: 'likes', select: 'username avatar' },
        ],
      },
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};
