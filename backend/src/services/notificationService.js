import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const getNotifications = async ({
  receiverId,
  isRead,
  limit = 10,
  page = 1,
}) => {
  const query = { receiverId };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('senderId', 'avatar username')
      .populate('receiverId', 'avatar username'),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: { total, page: Number(page), limit: Number(limit) },
  };
};

export const markAsRead = async (id) => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  )
    .populate('senderId', 'avatar username')
    .populate('receiverId', 'avatar username');
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { receiverId: userId, isRead: false },
    { isRead: true }
  );
  return { modifiedCount: result.modifiedCount };
};

// Helper function để generate message chi tiết
const generateMessage = (type, metadata, senderName) => {
  switch (type) {
    case 'like':
      return `${senderName} đã thích bài viết của bạn${
        metadata.postTitle ? `: "${metadata.postTitle}"` : ''
      }`;
    case 'comment':
      return `${senderName} đã bình luận về bài viết của bạn${
        metadata.postTitle ? `: "${metadata.postTitle}"` : ''
      }${metadata.comment ? `: "${metadata.comment.slice(0, 50)}..."` : ''}`;
    case 'follow':
      return `${senderName} đã theo dõi bạn`;
    case 'share':
      return `${senderName} đã chia sẻ bài viết của bạn${
        metadata.postTitle ? `: "${metadata.postTitle}"` : ''
      }`;
    case 'friend_request':
      return `${senderName} đã gửi yêu cầu kết bạn cho bạn`;
    case 'friend_accept':
      return `${senderName} đã chấp nhận yêu cầu kết bạn của bạn`;
    case 'system':
    default:
      return metadata.message || 'Bạn có thông báo mới';
  }
};

// Cập nhật createNotification
export const createNotification = async (data) => {
  const { senderId, receiverId, type, metadata = {} } = data;
  const sender = await User.findById(senderId).select('username'); // Giả sử có User model
  const message = generateMessage(type, metadata, sender.username);

  const notification = await Notification.create({
    ...data,
    message,
    metadata: { ...metadata, senderName: sender.username },
  });

  await notification.populate('senderId', 'avatar username');
  await notification.populate('receiverId', 'avatar username');

  return notification;
};
