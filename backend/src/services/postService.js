import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';
import * as postRepo from '../repositories/postRepository.js';
import * as commentRepo from '../repositories/commentRepository.js';
import Post from '../models/Post.js';
import * as activityRepo from '../repositories/activityRepository.js';
import * as reportRepo from '../repositories/reportRepository.js';

export const createPost = async ({ authorId, content, images }) => {
  return await postRepo.createPost({ author: authorId, content, images });
};

// Lấy danh sách bài viết
export const getPosts = async ({ type, limit, page = 1, userId }) => {
  const l = limit ? parseInt(limit) : 20;
  const p = page ? parseInt(page) : 1;
  const skip = (p - 1) * l;

  try {
    let posts;
    switch (type) {
      case 'recent':
        posts = await postRepo.findRecentPosts(l, skip);
        break;
      case 'hot':
        posts = await postRepo.findHotPosts(l, skip);
        break;
      case 'popular':
        posts = await postRepo.findPopularPosts(l, skip);
        break;
      default:
        posts = await postRepo.findRecentPosts(l, skip);
    }

    // Normalize dữ liệu trả về (không dùng helper riêng)
    return posts.map((post) => {
      // Lấy ra likes, comments, shares từ chính post
      const likes = post.likes;
      const comments = post.comments;
      const shares = post.shares;

      const postData = {
        ...post.toJSON(),
        likeCount: likes.length,
        commentCount: comments.length,
        shareCount: shares.length,
        isLikedByCurrentUser: userId
          ? likes.some((u) => u.id.toString() === userId)
          : false,
        likes: likes.map((u) => ({
          userId: u.id.toString(),
          username: u.username,
          avatar: u.avatar,
        })),
      };

      // Nếu có sharedFrom thì cũng normalize luôn
      if (postData.sharedFrom) {
        const sharedLikes = post.sharedFrom.likes;
        const sharedComments = post.sharedFrom.comments;
        const sharedShares = post.sharedFrom.shares;

        postData.sharedFrom = {
          ...postData.sharedFrom,
          likeCount: sharedLikes.length,
          commentCount: sharedComments.length,
          shareCount: sharedShares.length,
          isLikedByCurrentUser: userId
            ? sharedLikes.some((u) => u.id.toString() === userId)
            : false,
          likes: sharedLikes.map((u) => ({
            userId: u.id.toString(),
            username: u.username,
            avatar: u.avatar,
          })),
        };
      }

      return postData;
    });
  } catch (err) {
    console.error('Error in getPosts:', err);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Lỗi khi lấy danh sách bài viết'
    );
  }
};

export const deleteComment = async ({ postId, commentId }) => {
  const post = await postRepo.findPostById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết');
  }

  const comment = await commentRepo.findCommentById(commentId);
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bình luận');
  }

  // Xóa comment khỏi post
  post.comments = post.comments.filter((id) => id.toString() !== commentId);
  await post.save();

  // Xóa activities liên quan
  await activityRepo.deleteActivitiesByComment(commentId);

  // Xóa reports liên quan đến comment này
  await reportRepo.deleteReportsByComment(commentId);

  // Xóa comment
  await commentRepo.deleteComment(commentId);

  return { success: true };
};

export const getPost = async (postId) => {
  return postRepo.findPost(postId);
};

export const getPostDetail = async (postId, userId) => {
  const post = await postRepo.findPostAndIncreaseView(postId);

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }

  // Trực tiếp dùng dữ liệu đã populate
  const postData = {
    ...post.toJSON(),
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    shareCount: post.shares.length,
    isLikedByCurrentUser: userId
      ? post.likes.some((user) => user.id.toString() === userId)
      : false,
    likes: post.likes.map((user) => ({
      userId: user.id.toString(),
      username: user.username,
      avatar: user.avatar,
    })),
  };

  // Nếu là bài share thì xử lý tiếp
  if (postData.sharedFrom) {
    const sharedFrom = post.sharedFrom;

    postData.sharedFrom = {
      ...sharedFrom.toJSON(),
      likeCount: sharedFrom.likes.length,
      commentCount: sharedFrom.comments.length,
      shareCount: sharedFrom.shares.length,
      isLikedByCurrentUser: userId
        ? sharedFrom.likes.some((user) => user.id.toString() === userId)
        : false,
      likes: sharedFrom.likes.map((user) => ({
        userId: user.id.toString(),
        username: user.username,
        avatar: user.avatar,
      })),
    };
  }

  return postData;
};

// service/postService.ts
export const toggleLikePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }

  const isLiked = post.likes.some((id) => id.toString() === userId);

  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
    // xóa activity like
    const existing = await activityRepo.findExistingActivity({
      actor: userId,
      post: postId,
      type: 'like',
    });
    if (existing) {
      await activityRepo.deleteActivity(existing.id);
    }
  } else {
    post.likes.push(userId);
    await activityRepo.createActivity({
      actor: userId,
      post: postId,
      postOwner: post.author,
      type: 'like',
    });
  }

  await post.save();

  // Populate ngay sau khi save
  await post.populate({ path: 'likes', select: 'username avatar' });

  return {
    postId: post.id.toString(),
    isLiked: !isLiked,
    likeCount: post.likes.length,
    likes: post.likes.map((user) => ({
      userId: user.id.toString(),
      username: user.username,
      avatar: user.avatar,
    })),
  };
};

export const createComment = async ({ postId, userId, content }) => {
  const post = await postRepo.findPostById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }

  const comment = await commentRepo.createComment({
    postId,
    author: userId,
    content: content.trim(),
  });

  post.comments.push(comment.id);
  await post.save();

  await activityRepo.createActivity({
    actor: userId,
    post: postId,
    postOwner: post.author,
    type: 'comment',
    comment: comment.id,
  });

  return await commentRepo.findCommentById(comment.id);
};

export const sharePost = async ({ userId, postId, caption }) => {
  let original = await postRepo.findPostById(postId);
  if (!original) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }
  // nếu post hiện tại là bài share thì truy ngược về bài gốc
  // original.sharedFrom khác null là bài share
  if (original.sharedFrom) {
    original = await postRepo.findPostById(original.sharedFrom);
  }

  // tạo post share
  const shared = await postRepo.createPostShare({
    author: userId,
    caption: caption || '',
    sharedFrom: original.id,
  });

  // thêm vào danh sách share của bài gốc
  if (!original.shares.some((id) => id.toString() === shared.id.toString())) {
    original.shares.push(shared.id);
    await original.save();
  }

  return await postRepo.findPostDetail(shared.id, {
    populate: [
      { path: 'author', select: 'username avatar' },
      {
        path: 'sharedFrom',
        populate: { path: 'author', select: 'username avatar' },
      },
    ],
  });
};

export const checkIfLiked = async (postId, userId) => {
  const post = await Post.findById(postId).populate({
    path: 'likes',
    select: 'username avatar',
  });
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài Post');
  }

  const isLiked = post.likes.some((u) => u.id.toString() === userId);

  return isLiked;
};

// service/postService.ts
export const getUserPosts = async ({
  userId,
  limit,
  page = 1,
  currentUserId,
}) => {
  const l = limit ? parseInt(limit) : 20;
  const p = page ? parseInt(page) : 1;
  const skip = (p - 1) * l;

  try {
    const posts = await postRepo.findPostsByAuthor(userId, l, skip);

    // Normalize dữ liệu trả về (không dùng helper riêng)
    return posts.map((post) => {
      // Lấy ra likes, comments, shares từ chính post
      const likes = post.likes;
      const comments = post.comments;
      const shares = post.shares;

      const postData = {
        ...post.toJSON(),
        likeCount: likes.length,
        commentCount: comments.length,
        shareCount: shares.length,
        isLikedByCurrentUser: currentUserId
          ? likes.some((u) => u.id.toString() === currentUserId)
          : false,
        likes: likes.map((u) => ({
          userId: u.id.toString(),
          username: u.username,
          avatar: u.avatar,
        })),
      };

      // Nếu có sharedFrom thì cũng normalize luôn
      if (postData.sharedFrom) {
        const sharedLikes = post.sharedFrom.likes;
        const sharedComments = post.sharedFrom.comments;
        const sharedShares = post.sharedFrom.shares;

        postData.sharedFrom = {
          ...postData.sharedFrom,
          likeCount: sharedLikes.length,
          commentCount: sharedComments.length,
          shareCount: sharedShares.length,
          isLikedByCurrentUser: currentUserId
            ? sharedLikes.some((u) => u.id.toString() === currentUserId)
            : false,
          likes: sharedLikes.map((u) => ({
            userId: u.id.toString(),
            username: u.username,
            avatar: u.avatar,
          })),
        };
      }

      return postData;
    });
  } catch (err) {
    console.error('Error in getUserPosts:', err);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Lỗi khi lấy danh sách bài viết của người dùng'
    );
  }
};

// Cập nhật bài viết
export const updatePost = async ({ postId, content, images, userId }) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết');
  }

  // Không cho phép sửa bài share
  if (post.sharedFrom) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không thể chỉnh sửa bài viết được chia sẻ'
    );
  }

  // Cập nhật nội dung
  post.content = content;
  post.images = images || [];
  post.updatedAt = new Date();

  await post.save();

  // Populate để trả về đầy đủ thông tin
  await post.populate([
    { path: 'author', select: '_id username avatar' },
    { path: 'likes', select: 'username avatar' },
    { path: 'comments' },
    { path: 'shares' },
  ]);

  return {
    ...post.toJSON(),
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    shareCount: post.shares.length,
    isLikedByCurrentUser: post.likes.some(
      (user) => user.id.toString() === userId
    ),
    likes: post.likes.map((user) => ({
      userId: user.id.toString(),
      username: user.username,
      avatar: user.avatar,
    })),
  };
};

// Xóa bài viết
export const deletePost = async (postId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết');
  }

  // Nếu đây là bài gốc được share
  if (post.shares && post.shares.length > 0) {
    // Xóa tất cả bài share liên quan
    await Post.deleteMany({ sharedFrom: postId });
  }

  // Nếu đây là bài share, xóa khỏi danh sách shares của bài gốc
  if (post.sharedFrom) {
    const originalPost = await Post.findById(post.sharedFrom);
    if (originalPost) {
      originalPost.shares = originalPost.shares.filter(
        (id) => id.toString() !== postId
      );
      await originalPost.save();
    }
  }

  // Xóa tất cả comments của bài viết
  if (post.comments && post.comments.length > 0) {
    await commentRepo.deleteCommentsByPostId(postId);
  }

  // Xóa tất cả activities liên quan
  await activityRepo.deleteActivitiesByPost(postId);

  await reportRepo.deleteReportsByPost(postId);

  // Xóa bài viết
  await Post.findByIdAndDelete(postId);

  return { success: true };
};
