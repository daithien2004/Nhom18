import Message from '../models/Message.js';

export const createMessage = async ({
  conversationId,
  sender,
  text,
  attachments,
}) => {
  return await Message.create({ conversationId, sender, text, attachments });
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
