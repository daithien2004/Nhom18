import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

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
    .populate({ path: 'participants', select: 'username avatar isOnline' })
    .populate({ path: 'lastMessage' });
};

export const findConversationById = async (id) => {
  return await Conversation.findById(id)
    .populate({ path: 'participants', select: 'username avatar isOnline' })
    .populate({ path: 'lastMessage' });
};

export const findUserConversations = async (userId) => {
  return await Conversation.find({ participants: userId })
    .populate({
      path: 'participants',
      select: 'id username avatar status isOnline',
    })
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

export const updateStatus = async (conversationId, status) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { status: status, updatedAt: Date.now() },
    { new: true }
  );
};

export const getConversationSettings = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId).select(
    'settings'
  );
  return conversation?.settings || {};
};

export const updateConversationSettings = async (conversationId, settings) => {
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { settings } },
    { new: true }
  ).select('settings');
  return conversation.settings;
};

export const addMessageReaction = async (
  conversationId,
  messageId,
  userId,
  emoji
) => {
  const message = await Message.findById(messageId);
  if (!message || message.conversationId.toString() !== conversationId) {
    throw new Error(
      'Không tìm thấy tin nhắn hoặc tin nhắn không thuộc hội thoại'
    );
  } // xem xét
  message.reactions.set(userId, emoji);
  await message.save();
  return message;
};

export const removeMessageReaction = async (
  conversationId,
  messageId,
  userId
) => {
  const message = await Message.findById(messageId);
  if (!message || message.conversationId.toString() !== conversationId) {
    throw new Error(
      'Không tìm thấy tin nhắn hoặc tin nhắn không thuộc hội thoại'
    );
  } // xem xét
  message.reactions.delete(userId);
  await message.save();
  return message;
};

export const findConversationsByQuery = async (userId, query) => {
  return Conversation.find({
    participants: userId,
    isGroup: true,
    groupName: { $regex: query, $options: 'i' }, // tìm theo tên group
  })
    .populate('participants', 'username avatar')
    .populate('lastMessage');
};
