import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import classNames from 'classnames';
import {
  ChevronLeft,
  User,
  Video,
  Phone,
  Paperclip,
  Smile,
  Loader2,
} from 'lucide-react';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  selectConversation,
} from '../store/slices/conversationSlice';
import type { Message, Conversation } from '../types/message';

const ConversationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    conversations,
    messages,
    selectedConversationId,
    loadingConversations,
    loadingMessages,
    sendingMessage,
  } = useAppSelector((state) => state.conversations);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const selectedMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : [];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    const result = await dispatch(
      sendMessage({
        conversationId: selectedConversationId,
        text: newMessage,
      })
    );
    if (sendMessage.fulfilled.match(result)) {
      setNewMessage('');
      scrollToBottom();
    }
  };

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConversationId) {
      dispatch(
        fetchMessages({ conversationId: selectedConversationId, limit: 50 })
      );
    }
  }, [dispatch, selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedMessages]);

  return (
    <div className="flex bg-white">
      {/* Sidebar conversation list */}
      <aside className="w-64 bg-white fixed h-screen shadow-md p-6 flex flex-col">
        <div className="text-lg font-semibold mb-4">Chats</div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loadingConversations ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin w-4 h-4" />
              Đang tải...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-sm text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv: Conversation) => (
              <button
                key={conv.id}
                className={classNames(
                  'w-full px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center text-left transition-all duration-300',
                  {
                    'bg-gray-100 text-blue-600':
                      selectedConversationId === conv.id,
                  }
                )}
                onClick={() => dispatch(selectConversation(conv.id))}
                aria-label={`Mở cuộc trò chuyện với ${
                  conv.isGroup ? conv.groupName : conv.participants[0].username
                }`}
              >
                <img
                  src={
                    conv.isGroup
                      ? conv.groupAvatar || 'https://via.placeholder.com/48'
                      : conv.participants[0].avatar ||
                        'https://via.placeholder.com/48'
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {conv.isGroup
                      ? conv.groupName
                      : conv.participants[0].username}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-500 truncate">
                      {conv.lastMessage.text || '📎 File'}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(selectConversation(null))}
                    aria-label="Quay lại danh sách cuộc trò chuyện"
                    className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <User size={18} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {selectedConversation.isGroup
                      ? selectedConversation.groupName
                      : selectedConversation.participants[0].username}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    aria-label="Bắt đầu gọi điện"
                    className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <Phone
                      size={16}
                      className="text-gray-600 hover:text-blue-600"
                    />
                  </button>
                  <button
                    aria-label="Bắt đầu gọi video"
                    className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <Video
                      size={16}
                      className="text-gray-600 hover:text-blue-600"
                    />
                  </button>
                </div>
              </div>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-white rounded-2xl shadow-md space-y-3 scroll-smooth"
              >
                {loadingMessages ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="animate-spin w-4 h-4" />
                    Đang tải tin nhắn...
                  </div>
                ) : selectedMessages.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Không có tin nhắn nào
                  </div>
                ) : (
                  selectedMessages.map((msg: Message) => {
                    const isMe = msg.sender.id === userId;
                    return (
                      <div
                        key={msg.id}
                        className={classNames('flex', {
                          'justify-end': isMe,
                          'justify-start': !isMe,
                        })}
                      >
                        <div
                          className={classNames(
                            'px-3 py-2 rounded-2xl max-w-xs break-words shadow-sm',
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-3 flex items-center gap-2 bg-white rounded-2xl shadow-md">
                <button
                  aria-label="Đính kèm tệp"
                  className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <Paperclip
                    size={16}
                    className="text-gray-600 hover:text-blue-600"
                  />
                </button>
                <button
                  aria-label="Chọn biểu tượng cảm xúc"
                  className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <Smile
                    size={16}
                    className="text-gray-600 hover:text-blue-600"
                  />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  aria-label="Nhập tin nhắn"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className={classNames(
                    'inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300',
                    { 'opacity-50 cursor-not-allowed': sendingMessage }
                  )}
                  aria-label="Gửi tin nhắn"
                >
                  {sendingMessage && (
                    <Loader2 className="animate-spin w-4 h-4" />
                  )}
                  Gửi
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              Vui lòng chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConversationsPage;
