import * as postService from '../services/postService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createNotification } from '../services/notificationService.js';
import { sendMail } from '../services/emailService.js';
import User from '../models/User.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost({
    authorId: req.user.id,
    content: req.body.content,
    images: req.body.images,
  });
  return sendSuccess(res, post, 'Tạo bài viết thành công', 201);
});

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await postService.getPosts({
    type: req.query.type,
    limit: req.query.limit,
    page: req.query.page,
    userId: req.user.id,
  });
  return sendSuccess(res, posts, 'Lấy danh sách bài viết thành công');
});

export const getPostDetail = asyncHandler(async (req, res) => {
  const post = await postService.getPostDetail(req.params.postId, req.user.id);
  return sendSuccess(res, post, 'Lấy chi tiết bài viết thành công');
});

export const toggleLikePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  // Gọi toggleLikePost và lấy thông tin bài viết
  const result = await postService.toggleLikePost(postId, userId);

  return sendSuccess(res, result, 'Thao tác like thành công');
});

export const createComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const content = req.body.content;
  const comment = await postService.createComment({
    postId: postId,
    userId: userId,
    content: content,
  });

  // Kiểm tra xem người dùng có phải là tác giả bài viết không
  const post = await postService.getPost(postId);
  if (post.author.id !== userId) {
    // Chỉ tạo thông báo nếu không phải tự like
    const notification = await createNotification({
      senderId: userId, // Gửi thông báo cho tác giả bài viết
      receiverId: post.author.id,
      message: `${req.user.username} đã bình luận về bài viết của bạn`,
      type: 'comment',
      metadata: { postId, comment: content },
    });

    // Lấy io từ app
    const notiIo = req.app.get('notificationIo');
    // Emit realtime cho client của tác giả
    if (notiIo) {
      notiIo.to(post.author.id).emit('notification', notification);
      console.log('Notification sent to:', post.author);
    }

    const user = await User.findById(post.author.id);

    await sendMail({
      to: user.email, // lấy từ User model theo userId
      subject: 'Bạn có thông báo mới',
      text: `Đã bình luận về bài viết của bạn với nội dung ${content}`,
      html: `<p>Đã bình luận về bài viết của bạn với nội dung ${content}</p>`,
    });
  }

  return sendSuccess(res, comment, 'Tạo bình luận thành công', 201);
});

// Share post
export const sharePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const caption = req.body.caption;
  const shared = await postService.sharePost({
    userId: userId,
    postId: postId,
    caption: caption,
  });

  // Kiểm tra xem người dùng có phải là tác giả bài viết không
  const post = await postService.getPost(postId);
  if (post.author.id !== userId) {
    // Chỉ tạo thông báo nếu không phải tự like
    const notification = await createNotification({
      senderId: userId, // Gửi thông báo cho tác giả bài viết
      receiverId: post.author.id,
      message: `${req.user.username} đã chia sẻ bài viết của bạn`,
      type: 'share',
      metadata: { postId },
    });

    // Lấy io từ app
    const notiIo = req.app.get('notificationIo');
    // Emit realtime cho client của tác giả
    if (notiIo) {
      notiIo.to(post.author.id).emit('notification', notification);
      console.log('Notification sent to:', post.author);
    }

    const user = await User.findById(post.author.id);

    await sendMail({
      to: user.email, // lấy từ User model theo userId
      subject: 'Bạn có thông báo mới',
      text: `Đã chia sẻ bài viết của bạn với nội dung ${caption}`,
      html: `<p>Đã chia sẻ bài viết của bạn với nội dung ${caption}</p>`,
    });
  }

  return sendSuccess(res, shared, 'Chia sẻ bài viết thành công', 201);
});
