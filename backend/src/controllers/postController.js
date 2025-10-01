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

  const post = await postService.getPost(postId);
  const isLiked = await postService.checkIfLiked(postId, userId); // Kiểm tra like hiện tại

  const result = await postService.toggleLikePost(postId, userId);

  if (isLiked === false && post.author.id !== userId) {
    // Nếu mới like (không phải unlike)
    const notification = await createNotification({
      senderId: userId,
      receiverId: post.author.id,
      type: 'like',
      metadata: {
        postId,
        postTitle: post.title || post.content.slice(0, 30) + '...', // Preview tiêu đề
        postThumbnail: post.images?.[0] || null,
      },
    });

    // Emit Socket.IO
    const notiIo = req.app.get('notificationIo');
    if (notiIo) {
      notiIo.to(post.author.id).emit('notification', notification);
      console.log('Notification sent to:', post.author);
    }

    // Gửi email
    const authorUser = await User.findById(post.author.id);
    await sendMail({
      to: authorUser.email,
      subject: `${authorUser.username} đã like bài viết của bạn!`,
      text: notification.message,
      html: `<p>${notification.message}</p><br/><a href="/posts/${postId}">Xem bài viết</a>`,
    });
  }

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
    const notification = await createNotification({
      senderId: userId,
      receiverId: post.author.id,
      type: 'comment',
      metadata: {
        postId,
        postTitle: post.title || post.content.slice(0, 30) + '...',
        postThumbnail: post.images?.[0] || null,
        comment: content,
      },
    });

    // Lấy io từ app
    const notiIo = req.app.get('notificationIo');
    // Emit realtime cho client của tác giả
    if (notiIo) {
      notiIo.to(post.author.id).emit('notification', notification);
      console.log('Notification sent to:', post.author);
    }

    // Gửi email
    const authorUser = await User.findById(post.author.id);
    await sendMail({
      to: authorUser.email,
      subject: `${authorUser.username} đã bình luận về bài viết của bạn!`,
      text: notification.message,
      html: `<p>${notification.message}</p><br/><a href="/posts/${postId}">Xem bài viết</a>`,
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
    const notification = await createNotification({
      senderId: userId, // Gửi thông báo cho tác giả bài viết
      receiverId: post.author.id,
      type: 'share',
      metadata: {
        postId,
        postTitle: post.title || post.content.slice(0, 30) + '...',
        postThumbnail: post.images?.[0] || null,
      },
    });

    // Lấy io từ app
    const notiIo = req.app.get('notificationIo');
    // Emit realtime cho client của tác giả
    if (notiIo) {
      notiIo.to(post.author.id).emit('notification', notification);
      console.log('Notification sent to:', post.author);
    }

    // Gửi email
    const authorUser = await User.findById(post.author.id);
    await sendMail({
      to: authorUser.email,
      subject: `${authorUser.username} đã chia sẻ bài viết của bạn!`,
      text: notification.message,
      html: `<p>${notification.message}</p><br/><a href="/posts/${postId}">Xem bài viết</a>`,
    });
  }

  return sendSuccess(res, shared, 'Chia sẻ bài viết thành công', 201);
});
