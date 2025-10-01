import mongoose from 'mongoose';
import * as conversationRepo from '../repositories/conversationRepository.js';
import * as messageRepo from '../repositories/messageRepository.js';

export const createConversation = async ({
  participants,
  isGroup,
  groupName,
  groupAvatar,
  status,
}) => {
  console.log(participants);
  participants = participants.map((id) => new mongoose.Types.ObjectId(id));

  const conv = await conversationRepo.createConversation(
    participants,
    isGroup,
    groupName,
    groupAvatar,
    status
  );

  return conv;
};

export const getMessages = async ({ conversationId, page = 1, limit }) => {
  const skip = (page - 1) * limit;
  const conv = await conversationRepo.findConversationById(conversationId);
  if (!conv)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hội thoại');

  return await messageRepo.getMessages(conversationId, limit, skip);
};

export const getConversationBetweenUsers = async (userId1, userId2) => {
  const conv = await conversationRepo.findConversationBetweenUsers(
    userId1,
    userId2
  );

  return conv;
};

export const getConversations = async (userId) => {
  return await conversationRepo.findUserConversations(userId);
};

export const getConversationSettings = async (conversationId) => {
  return await conversationRepo.getConversationSettings(conversationId);
};

export const updateConversationSettings = async (conversationId, settings) => {
  // Chỉ cập nhật các field được gửi
  const currentSettings = await conversationRepo.getConversationSettings(
    conversationId
  );
  const updatedSettings = {
    theme: settings.theme ?? currentSettings.theme,
    customEmoji: settings.customEmoji ?? currentSettings.customEmoji,
    notificationsEnabled:
      settings.notificationsEnabled ?? currentSettings.notificationsEnabled,
  };
  return await conversationRepo.updateConversationSettings(
    conversationId,
    updatedSettings
  );
};

export const addMessageReaction = async (
  conversationId,
  messageId,
  userId,
  emoji
) => {
  return await conversationRepo.addMessageReaction(
    conversationId,
    messageId,
    userId,
    emoji
  );
};

export const searchConversations = async (userId, query) => {
  const conversations = await conversationRepo.findConversationsByQuery(
    userId,
    query
  );
  return conversations;
};
