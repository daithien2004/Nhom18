import Conversation from '../models/Conversation.js';

export const createConversation = async ({
  participants,
  isGroup,
  groupName,
  groupAvatar,
}) => {
  return await Conversation.create({
    participants,
    isGroup,
    groupName,
    groupAvatar,
  });
};

export const findConversationById = async (id) => {
  return await Conversation.findById(id)
    .populate({ path: 'participants', select: 'username avatar' })
    .populate({ path: 'lastMessage' })
    .lean();
};

export const findUserConversations = async (userId) => {
  return await Conversation.find({ participants: userId })
    .populate({ path: 'participants', select: 'username avatar' })
    .populate({ path: 'lastMessage' })
    .sort({ updatedAt: -1 })
    .lean();
};

export const updateLastMessage = async (conversationId, messageId) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage: messageId, updatedAt: Date.now() },
    { new: true }
  );
};
