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

// Schema cho body của updateConversationSettings
export const conversationSettingsSchema = z
  .object({
    theme: z.string().optional(),
    customEmoji: z.string().optional(),
    notificationsEnabled: z.boolean().optional(),
  })
  .strict();

// Schema cho body của addMessageReaction
export const messageReactionSchema = z.object({
  emoji: z.string().nonempty('Thiếu Emoji'),
});

// Schema cho params của addMessageReaction
export const messageReactionParamsSchema = z.object({
  conversationId: z.string().nonempty('Thiếu conversationId'),
  messageId: z.string().nonempty(' Thiếu messageId'),
});

// New schema for updating message status
export const messageStatusSchema = z.object({
  status: z.enum(['delivered', 'seen'], {
    required_error: 'Yêu cầu key status',
    invalid_type_error: 'Yêu cầu status phải là "delivered" hoặc "seen"',
  }),
});
