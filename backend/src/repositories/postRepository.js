import Post from "../models/Post.js";

// Tạo post (hỗ trợ sharedFrom và images mặc định)
export const createPost = async ({ author, content, images = [] }) => {
  return await Post.create({ author, content, images });
};

// Tạo post (hỗ trợ sharedFrom và images mặc định)
export const createPostShare = async ({
  author,
  caption,
  sharedFrom = null,
}) => {
  return await Post.create({ author, caption, sharedFrom });
};

export const findRecentPosts = async (limit, skip) => {
  return await Post.find()
    .populate("author", "username avatar")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username avatar" },
      options: { strictPopulate: false },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const findHotPosts = async (limit, skip) => {
  const agg = await Post.aggregate([
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
    { $sort: { totalInteractions: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return await Post.populate(agg, [
    { path: "author", select: "username avatar" },
    {
      path: "comments",
      populate: { path: "author", select: "username avatar" },
      options: { strictPopulate: false },
    },
  ]);
};

export const findPopularPosts = async (limit, skip) => {
  return await Post.find()
    .populate("author", "username avatar")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username avatar" },
      options: { strictPopulate: false },
    })
    .sort({ views: -1 })
    .skip(skip)
    .limit(limit);
};

export const findPostById = async (id) => {
  return await Post.findById(id);
};

export const findPostAndIncreaseView = async (postId) => {
  return await Post.findByIdAndUpdate(
    postId,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("author", "username avatar isOnline")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username avatar" },
    })
    .lean();
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
