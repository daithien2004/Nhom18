import {
  createPostService,
  getPostsService,
  getPostByIdService,
} from '../services/postService.js';

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

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostByIdService(id);
    res.json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
