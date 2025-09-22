import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  createConversation,
  getConversations,
  getMessages,
  getOrCreateConversation,
  sendMessage,
} from '../controllers/conversationController.js';
import {
  conversationIdSchema,
  messageQuerySchema,
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

export default router;
