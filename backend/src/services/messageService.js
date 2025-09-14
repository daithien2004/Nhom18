import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';
import * as conversationRepo from '../repositories/conversationRepository.js';
import * as messageRepo from '../repositories/messageRepository.js';

export const sendMessage = async ({
  conversationId,
  senderId,
  text,
  attachments,
}) => {
  const conv = await conversationRepo.findConversationById(conversationId);
  if (!conv)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hội thoại');

  const message = await messageRepo.createMessage({
    conversationId,
    sender: senderId,
    text: text?.trim(),
    attachments,
  });

  await conversationRepo.updateLastMessage(conversationId, message._id);

  return message;
};

export const getMessages = async ({ conversationId, limit }) => {
  const conv = await conversationRepo.findConversationById(conversationId);
  if (!conv)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hội thoại');

  return await messageRepo.findMessagesByConversation(conversationId, limit);
};

export const getConversations = async (userId) => {
  return await conversationRepo.findUserConversations(userId);
};
