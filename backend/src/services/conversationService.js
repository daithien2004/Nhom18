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
