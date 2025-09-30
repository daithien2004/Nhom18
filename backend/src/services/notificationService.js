import Notification from '../models/Notification.js';

export const createNotification = async (data) => {
  return await Notification.create(data);
};

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

// export const markAsRead = async (id) => {
//   return await Notification.findByIdAndUpdate(
//     id,
//     { isRead: true },
//     { new: true }
//   );
// };

// export const markAllAsRead = async (userId) => {
//   const result = await Notification.updateMany({ userId }, { isRead: true });
//   return { modifiedCount: result.modifiedCount };
// };
