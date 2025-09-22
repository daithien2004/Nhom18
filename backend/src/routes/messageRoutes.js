import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validation.js';
import {
  markAsReadSchema,
} from '../schemas/messageSchemas.js';
import {
  markAsRead,
} from '../controllers/messageController.js';

const router = Router();

router.patch(
  '/:messageId/read',
  auth,
  validateParams(markAsReadSchema),
  markAsRead
);

export default router;
