import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  addMessageReaction,
  createConversation,
  getConversations,
  getConversationSettings,
  getMessages,
  getOrCreateConversation,
  removeMessageReaction,
  searchConversation,
  sendMessage,
  updateConversationSettings,
  updateMessageStatus,
} from '../controllers/conversationController.js';
import {
  conversationIdSchema,
  conversationSettingsSchema,
  messageQuerySchema,
  messageReactionParamsSchema,
  messageReactionSchema,
  messageStatusSchema,
  sendMessageSchema,
} from '../schemas/messageSchemas.js';
import {
  validateParams,
  validateQuery,
  validateBody,
} from '../middlewares/validation.js';
const router = Router();

// Lấy danh sách tất cả conversation của user
router.get('/', auth, getConversations);

// Tạo conversation mới (chat nhóm)
router.post('/', auth, createConversation);

// Tạo tìm conversation nhóm
router.get('/search', auth, searchConversation);

// Lấy conversation 1-1 với 1 user
router.get('/1on1/:userId', auth, getOrCreateConversation);

// Lấy tin nhắn trong 1 hội thoại
router.get(
  '/:conversationId/messages',
  auth,
  validateParams(conversationIdSchema),
  validateQuery(messageQuerySchema),
  getMessages
);

// Gửi tin nhắn
router.post(
  '/:conversationId/messages',
  auth,
  validateParams(conversationIdSchema),
  validateBody(sendMessageSchema),
  sendMessage
);

// Lấy cài đặt hội thoại
router.get(
  '/:conversationId/settings',
  auth,
  validateParams(conversationIdSchema),
  getConversationSettings
);

// Cập nhật cài đặt hội thoại
router.post(
  '/:conversationId/settings',
  auth,
  validateParams(conversationIdSchema),
  validateBody(conversationSettingsSchema),
  updateConversationSettings
);

// Thêm reaction cho tin nhắn
router.post(
  '/:conversationId/messages/:messageId/reactions',
  auth,
  validateParams(messageReactionParamsSchema),
  validateBody(messageReactionSchema),
  addMessageReaction
);

// Xóa reaction đã thêm
router.delete(
  '/:conversationId/messages/:messageId/reactions',
  auth,
  validateParams(messageReactionParamsSchema),
  removeMessageReaction
);

// New endpoint: Cập nhật trạng thái tin nhắn
router.patch(
  '/:conversationId/messages/:messageId/status',
  auth,
  validateParams(messageReactionParamsSchema), // Re-use for conversationId & messageId
  validateBody(messageStatusSchema),
  updateMessageStatus
);

export default router;
