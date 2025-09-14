import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as messageService from '../services/messageService.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const msg = await messageService.sendMessage({
    conversationId: req.params.conversationId,
    senderId: req.user.id,
    text: req.body.text,
    attachments: req.body.attachments,
  });
  return sendSuccess(res, msg, 'Gửi tin nhắn thành công', 201);
});

export const getMessages = asyncHandler(async (req, res) => {
  const msgs = await messageService.getMessages({
    conversationId: req.params.conversationId,
    limit: req.query.limit,
  });
  return sendSuccess(res, msgs, 'Lấy danh sách tin nhắn thành công');
});

export const getConversations = asyncHandler(async (req, res) => {
  const convs = await messageService.getConversations(req.user.id);
  return sendSuccess(res, convs, 'Lấy danh sách hội thoại thành công');
});
