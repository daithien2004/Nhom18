import Message from '../models/Message.js';

export const createMessage = async ({
  conversationId,
  sender,
  text,
  attachments,
}) => {
  return await Message.create({ conversationId, sender, text, attachments });
};

export const findMessagesByConversation = async (
  conversationId,
  limit = 50
) => {
  return await Message.find({ conversationId })
    .populate({ path: 'sender', select: 'username avatar' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const markMessageAsRead = async (messageId, userId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { readBy: userId } },
    { new: true }
  );
};
