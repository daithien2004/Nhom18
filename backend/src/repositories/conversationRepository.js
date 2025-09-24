import Conversation from '../models/Conversation.js';

export const createConversation = async (
  participants,
  isGroup,
  groupName,
  groupAvatar,
  status = 'pending'
) => {
  return await Conversation.create({
    participants,
    isGroup,
    groupName,
    groupAvatar,
    status,
  });
};

export const findConversationBetweenUsers = async (userId1, userId2) => {
  return await Conversation.findOne({
    isGroup: false, // chỉ chat 1-1
    participants: { $all: [userId1, userId2], $size: 2 },
  })
    .populate({ path: 'participants', select: 'username avatar' })
    .populate({ path: 'lastMessage' });
};

export const findConversationById = async (id) => {
  return await Conversation.findById(id)
    .populate({ path: 'participants', select: 'username avatar' })
    .populate({ path: 'lastMessage' });
};

export const findUserConversations = async (userId) => {
  return await Conversation.find({ participants: userId })
    .populate({ path: 'participants', select: 'username avatar' })
    .populate({ path: 'lastMessage' })
    .sort({ updatedAt: -1 });
};

export const updateLastMessage = async (conversationId, messageId) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage: messageId, updatedAt: Date.now() },
    { new: true }
  );
};
