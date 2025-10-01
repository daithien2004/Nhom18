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

  // Kiểm tra trạng thái hợp lệ
  if (message.status === 'seen' && status === 'delivered')
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không thể chuyển từ seen về delivered'
    );

  // Cập nhật trạng thái
  if (status === 'delivered' && message.status === 'sent') {
    message.status = 'delivered';
  } else if (status === 'seen') {
    // CHO PHÉP CẬP NHẬT readBy BAT KỂ STATUS LÀ GÌ
    // Chỉ cập nhật status nếu chưa phải 'seen'
    if (['sent', 'delivered'].includes(message.status)) {
      message.status = 'seen';
    }

    // Luôn thêm userId vào readBy nếu chưa có (cho chat nhóm)
    if (!message.readBy.map((id) => id.toString()).includes(userId)) {
      message.readBy.push(userId);
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
