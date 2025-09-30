import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  addMessageReaction,
  createConversation,
  getConversations,
  getConversationSettings,
  getMessages,
  getOrCreateConversation,
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

// New endpoint: Cập nhật trạng thái tin nhắn
router.patch(
  '/:conversationId/messages/:messageId/status',
  auth,
  validateParams(messageReactionParamsSchema), // Re-use for conversationId & messageId
  validateBody(messageStatusSchema),
  updateMessageStatus
);

export default router;
