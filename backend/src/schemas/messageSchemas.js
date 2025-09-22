import { z } from 'zod';

export const conversationIdSchema = z.object({
  conversationId: z.string().min(1, { message: 'Thiếu conversationId' }),
});

export const sendMessageSchema = z.object({
  text: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
});

export const messageQuerySchema = z.object({
  limit: z.string().optional(),
  page: z.string().optional(),
});

export const markAsReadSchema = z.object({
  conversationId: z.string().min(1, { message: 'Thiếu conversationId' }),
  messageId: z.string().min(1, { message: 'Thiếu messageId' }),
});
