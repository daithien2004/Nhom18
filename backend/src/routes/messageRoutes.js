import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validation.js';
import {
  sendMessageSchema,
  conversationIdSchema,
  messageQuerySchema,
} from '../schemas/messageSchemas.js';
import {
  sendMessage,
  getMessages,
  getConversations,
} from '../controllers/messageController.js';

const router = Router();

// Lấy danh sách hội thoại của user
router.get('/conversations', auth, getConversations);

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
