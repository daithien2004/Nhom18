// src/store/slices/messageSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Message, Conversation } from '../../types/message';
import instance from '../../api/axiosInstant';

// ------------------------
// Async thunks
// ------------------------
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async () => {
    const res = await instance.get('/messages/conversations');
    return res.data.data as Conversation[];
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (payload: { conversationId: string; limit?: number }) => {
    const { conversationId, limit } = payload;
    const res = await instance.get(`/messages/${conversationId}/messages`, {
      params: { limit },
    });
    return { conversationId, messages: res.data.data as Message[] };
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (payload: {
    conversationId: string;
    text: string;
    attachments?: string[];
  }) => {
    const res = await instance.post(
      `/messages/${payload.conversationId}/messages`,
      {
        text: payload.text,
        attachments: payload.attachments,
      }
    );
    return {
      conversationId: payload.conversationId,
      message: res.data.data as Message,
    };
  }
);

// ------------------------
// Slice
// ------------------------
interface MessagesState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // key: conversationId
  selectedConversationId: string | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  messages: {},
  selectedConversationId: null,
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
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
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.loadingConversations = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.loadingConversations = false;
      state.conversations = action.payload;
      // Auto select first conversation if none selected
      if (!state.selectedConversationId && action.payload.length > 0) {
        state.selectedConversationId = action.payload[0]._id;
      }
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.loadingConversations = false;
      state.error = 'Failed to fetch conversations';
    });

    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loadingMessages = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loadingMessages = false;
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages.reverse(); // newest last
    });
    builder.addCase(fetchMessages.rejected, (state) => {
      state.loadingMessages = false;
      state.error = 'Failed to fetch messages';
    });

    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.sendingMessage = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.sendingMessage = false;
      const { conversationId, message } = action.payload;

      // Push new message
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);

      // Update lastMessage in conversation
      const convIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
      }
    });
    builder.addCase(sendMessage.rejected, (state) => {
      state.sendingMessage = false;
      state.error = 'Failed to send message';
    });
  },
});

export const { selectConversation, clearMessagesState } = messageSlice.actions;
export default messageSlice.reducer;
