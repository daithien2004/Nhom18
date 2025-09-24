import Message from '../models/Message.js';

export const createMessage = async ({
  conversationId,
  sender,
  text,
  attachments,
}) => {
  const message = await Message.create({
    conversationId,
    sender: sender,
    text,
    attachments,
    readBy: [sender], // Đánh dấu đã đọc bởi người gửi
  });

  // Populate sender info trước khi return
  return await message.populate('sender', 'id username avatar');
};

export const markAsRead = async (conversationId, messageId, userId) => {
  return await Message.findOneAndUpdate(
    { _id: messageId, conversationId },
    { $addToSet: { readBy: userId } },
    { new: true }
  );
};

export const getMessages = async (conversationId, limit, skip) => {
  return await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar');
};
