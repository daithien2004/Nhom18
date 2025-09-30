import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Conversation, Message } from '../../types/message';
import instance from '../../api/axiosInstant';

export const fetchConversations = createAsyncThunk(
  'conversations/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await instance.get('/conversations');
      return res.data as Conversation[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch conversations'
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'conversations/fetchMessages',
  async (
    payload: {
      conversationId: string;
      limit?: number;
      page?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { conversationId, limit, page } = payload;
      const res = await instance.get(
        `/conversations/${conversationId}/messages`,
        {
          params: { limit, page },
        }
      );
      return { conversationId, messages: res.data as Message[] };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch messages'
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  'conversations/sendMessage',
  async (
    payload: {
      conversationId: string;
      text: string;
      attachments?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(
        `/conversations/${payload.conversationId}/messages`,
        {
          text: payload.text,
          attachments: payload.attachments,
        }
      );

      return {
        conversationId: payload.conversationId,
        message: {
          id: res.data.id,
          sender: res.data.sender, // Should be full sender object from API
          conversationId: res.data.conversationId,
          text: res.data.text,
          attachments: res.data.attachments || [],
          createdAt: res.data.createdAt,
        } as Message,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Lỗi khi gửi tin nhắn'
      );
    }
  }
);

// Fetch conversation settings
export const fetchConversationSettings = createAsyncThunk(
  'conversations/fetchConversationSettings',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await instance.get(
        `/conversations/${conversationId}/settings`
      );
      return { conversationId, settings: res.data as ConversationSettings };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch conversation settings'
      );
    }
  }
);

// Update conversation settings
export const updateConversationSettings = createAsyncThunk(
  'conversations/updateConversationSettings',
  async (
    payload: {
      conversationId: string;
      settings: Partial<ConversationSettings>;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(
        `/conversations/${payload.conversationId}/settings`,
        payload.settings
      );
      return {
        conversationId: payload.conversationId,
        settings: res.data as ConversationSettings,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update conversation settings'
      );
    }
  }
);

// Add reaction to a message
export const addMessageReaction = createAsyncThunk(
  'conversations/addMessageReaction',
  async (
    payload: {
      conversationId: string;
      messageId: string;
      userId: string;
      emoji: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(
        `/conversations/${payload.conversationId}/messages/${payload.messageId}/reactions`,
        {
          userId: payload.userId,
          emoji: payload.emoji,
        }
      );
      return {
        conversationId: payload.conversationId,
        messageId: payload.messageId,
        reaction: { [payload.userId]: payload.emoji },
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add reaction'
      );
    }
  }
);

export interface ConversationSettings {
  theme: string;
  customEmoji: string;
  notificationsEnabled: boolean;
}

// ------------------------
// Slice
// ------------------------
interface ConversationsState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // key: conversationId
  settings: Record<string, ConversationSettings>;
  selectedConversationId: string | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;
}

const initialState: ConversationsState = {
  conversations: [],
  messages: {},
  settings: {},
  selectedConversationId: null,
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
};

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Prevent duplicate messages
      const messageExists = state.messages[conversationId].some(
        (m) => m.id === message.id
      );
      if (!messageExists) {
        state.messages[conversationId].push(message);

        // Update lastMessage in conversations
        const convIndex = state.conversations.findIndex(
          (c) => c.id === conversationId
        );
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = message;
          // Move conversation to top
          const conversation = state.conversations[convIndex];
          state.conversations.splice(convIndex, 1);
          state.conversations.unshift(conversation);
        }
      }
    },

    selectConversation: (state, action: PayloadAction<string | null>) => {
      state.selectedConversationId = action.payload;
    },

    clearMessagesState: (state) => {
      state.conversations = [];
      state.messages = {};
      state.selectedConversationId = null;
      state.loadingConversations = false;
      state.loadingMessages = false;
      state.sendingMessage = false;
      state.error = null;
    },
    updateSettings: (
      state,
      action: PayloadAction<{
        conversationId: string;
        settings: Partial<ConversationSettings>;
      }>
    ) => {
      const { conversationId, settings } = action.payload;
      state.settings[conversationId] = {
        ...state.settings[conversationId],
        ...settings,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
        // Auto select first conversation if none selected
        if (!state.selectedConversationId && action.payload.length > 0) {
          state.selectedConversationId = action.payload[0].id;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages.reverse(); // newest last
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        // Add message immediately when send succeeds
        const { conversationId, message } = action.payload;
        conversationSlice.caseReducers.addMessage(state, {
          type: 'conversations/addMessage',
          payload: { conversationId, message },
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload as string;
      });

    // Fetch conversation settings
    builder
      .addCase(fetchConversationSettings.pending, (state) => {
        state.loadingMessages = true; // Có thể dùng một state riêng như loadingSettings
        state.error = null;
      })
      .addCase(fetchConversationSettings.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { conversationId, settings } = action.payload;
        state.settings[conversationId] = settings;
      })
      .addCase(fetchConversationSettings.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      });

    // Update conversation settings
    builder
      .addCase(updateConversationSettings.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(updateConversationSettings.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { conversationId, settings } = action.payload;
        state.settings[conversationId] = settings;
      })
      .addCase(updateConversationSettings.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      });

    // Add message reaction
    builder
      .addCase(addMessageReaction.fulfilled, (state, action) => {
        const { conversationId, messageId, reaction } = action.payload;
        const messages = state.messages[conversationId];
        if (messages) {
          const messageIndex = messages.findIndex((m) => m.id === messageId);
          if (messageIndex !== -1) {
            messages[messageIndex].reactions = {
              ...messages[messageIndex].reactions,
              ...reaction,
            };
          }
        }
      })
      .addCase(addMessageReaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  selectConversation,
  clearMessagesState,
  addMessage,
  updateSettings,
} = conversationSlice.actions;
export default conversationSlice.reducer;
