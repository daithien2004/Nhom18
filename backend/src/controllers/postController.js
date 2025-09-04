import {
  createPostService,
  getPostsService,
  getPostDetailService,
} from "../services/postService.js";

export const createPost = async (req, res) => {
  try {
    const { content, images } = req.body;
    const authorId = req.user.id; // từ middleware auth

    const post = await createPostService({ authorId, content, images });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { type, limit } = req.query;

    const posts = await getPostsService({ type, limit });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostDetail = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await getPostDetailService(postId, userId);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
