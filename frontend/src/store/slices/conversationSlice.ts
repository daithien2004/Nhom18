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

// ------------------------
// Slice
// ------------------------
interface ConversationsState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // key: conversationId
  selectedConversationId: string | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;
}

const initialState: ConversationsState = {
  conversations: [],
  messages: {},
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
  },
});

export const { selectConversation, clearMessagesState, addMessage } =
  conversationSlice.actions;
export default conversationSlice.reducer;
