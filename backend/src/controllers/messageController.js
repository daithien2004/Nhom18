import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as messageService from '../services/messageService.js';

export const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId, messageId } = req.params;
  const updatedMessage = await messageService.markAsRead(
    conversationId,
    messageId,
    req.user.id
  );
  return sendSuccess(res, { updatedMessage }, 'Đánh dấu đã đọc thành công');
});
