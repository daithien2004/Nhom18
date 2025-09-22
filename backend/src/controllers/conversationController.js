import * as conversationService from '../services/conversationService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as messageService from '../services/messageService.js';

export const createConversation = asyncHandler(async (req, res) => {
  const { participants, isGroup, groupName, groupAvatar, status } = req.body;

  // thêm luôn user đang login vào participants nếu chưa có
  if (!participants.includes(req.user.id.toString())) {
    participants.push(req.user.id);
  }

  const conversation = await conversationService.createConversation(
    participants,
    isGroup,
    groupName,
    groupAvatar,
    status
  );

  return sendSuccess(res, conversation, 'Tạo hội thoại thành công');
});

export const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const msgs = await conversationService.getMessages({
    conversationId: req.params.conversationId,
    page,
    limit,
  });
  return sendSuccess(res, msgs, 'Lấy danh sách tin nhắn thành công');
});

export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params; // người kia
  const currentUserId = req.user.id;

  // 1. Tìm conversation đã tồn tại
  let conversation = await conversationService.getConversationBetweenUsers(
    userId,
    currentUserId
  );

  // 2. Nếu chưa có → tạo mới
  if (!conversation) {
    const participants = [userId, currentUserId];

    conversation = await conversationService.createConversation({
      participants,
      isGroup: false,
      status: 'pending', // 👈 vì chưa kết bạn
    });
  }

  return sendSuccess(res, conversation, 'Lấy hoặc tạo hội thoại thành công');
});

export const getConversations = asyncHandler(async (req, res) => {
  const convs = await conversationService.getConversations(req.user.id);
  return sendSuccess(res, convs, 'Lấy danh sách hội thoại thành công');
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text, attachments } = req.body;

  const message = await messageService.sendMessage(
    conversationId,
    req.user.id,
    text,
    attachments
  );

  // Lấy io từ app
  const io = req.app.get('io');
  // Emit realtime cho các client trong conversation
  if (io) {
    io.to(conversationId).emit('newMessage', message);
  }

  return sendSuccess(res, message, 'Gửi tin nhắn thành công');
});
