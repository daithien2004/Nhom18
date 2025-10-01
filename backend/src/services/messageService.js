import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';
import * as conversationRepo from '../repositories/conversationRepository.js';
import * as messageRepo from '../repositories/messageRepository.js';

export const sendMessage = async (
  conversationId,
  senderId,
  text,
  attachments
) => {
  const conv = await conversationRepo.findConversationById(conversationId);
  if (!conv)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hội thoại');

  const message = await messageRepo.createMessage({
    conversationId,
    sender: senderId,
    text: text?.trim(),
    attachments,
  });

  await conversationRepo.updateLastMessage(conversationId, message.id);

  return message;
};

export const markAsRead = async (conversationId, messageId, userId) => {
  return await messageRepo.markAsRead(conversationId, messageId, userId);
};

export const updateMessageStatus = async (
  conversationId,
  messageId,
  userId,
  status
) => {
  const conv = await conversationRepo.findConversationById(conversationId);
  if (!conv)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hội thoại');

  const message = await messageRepo.findMessageById(messageId);
  if (!message || message.conversationId.toString() !== conversationId)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Không tìm thấy tin nhắn hoặc tin nhắn không thuộc hội thoại'
    );

  // Kiểm tra user có phải là participant trong conversation
  if (!conv.participants.map((p) => p.id.toString()).includes(userId))
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Bạn không có quyền cập nhật trạng thái tin nhắn'
    );

  // Kiểm tra user đã đọc tin nhắn này chưa (tránh duplicate)
  const hasUserRead = message.readBy
    .map((id) => id.toString())
    .includes(userId);

  // Kiểm tra trạng thái hợp lệ
  if (status === 'delivered') {
    // Không cho phép chuyển từ seen về delivered
    if (message.status === 'seen')
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Không thể chuyển từ seen về delivered'
      );

    // Cập nhật status nếu đang ở sent
    if (message.status === 'sent') {
      message.status = 'delivered';
    }
  } else if (status === 'seen') {
    // Nếu user đã seen rồi, không cần làm gì (idempotent)
    if (hasUserRead) {
      return message.populate('sender', 'id username avatar');
    }

    // Thêm userId vào readBy
    message.readBy.push(userId);

    // Chỉ cập nhật status thành 'seen' nếu chưa phải 'seen'
    if (message.status !== 'seen') {
      message.status = 'seen';
    }
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Trạng thái cập nhật không hợp lệ'
    );
  }

  await message.save();
  return message.populate('sender', 'id username avatar');
};
