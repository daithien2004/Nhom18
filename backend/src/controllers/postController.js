import {
  createPostService,
  getPostsService,
  getPostDetailService,
  toggleLikePostService,
  createCommentService,
} from "../services/postService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const createPost = asyncHandler(async (req, res) => {
  const post = await createPostService({ 
    authorId: req.user.id, 
    content: req.body.content, 
    images: req.body.images 
  });
  return sendSuccess(res, post, 'Tạo bài viết thành công', 201);
});

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await getPostsService({ 
    type: req.query.type, 
    limit: req.query.limit 
  });
  return sendSuccess(res, posts, 'Lấy danh sách bài viết thành công');
});

export const getPostDetail = asyncHandler(async (req, res) => {
  const post = await getPostDetailService(req.params.postId, req.user.id);
  return sendSuccess(res, post, 'Lấy chi tiết bài viết thành công');
});

export const toggleLikePost = asyncHandler(async (req, res) => {
  const result = await toggleLikePostService(req.params.postId, req.user.id);
  return sendSuccess(res, result, 'Thao tác like thành công');
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await createCommentService({ 
    postId: req.params.postId, 
    userId: req.user.id, 
    content: req.body.content 
  });
  return sendSuccess(res, comment, 'Tạo bình luận thành công', 201);
});
