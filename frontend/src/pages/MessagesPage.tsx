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
} from 'lucide-react';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  selectConversation,
} from '../store/slices/messageSlice';
import type { Message, Conversation } from '../types/message';

const MessagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    conversations,
    messages,
    selectedConversationId,
    loadingConversations,
    loadingMessages,
    sendingMessage,
  } = useAppSelector((state) => state.messages);
  const userId = useAppSelector((state) => state.auth.user?._id); // Lấy ID người dùng từ auth
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (c) => c._id === selectedConversationId
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
    <div className="flex h-[calc(100vh-2rem)] border rounded-lg overflow-hidden shadow ml-15">
      {/* Sidebar conversation list */}
      <div className="w-80 bg-gray-100 border-r flex flex-col">
        <div className="p-3 font-semibold border-b">Chats</div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-3 text-gray-500">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="p-3 text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv: Conversation) => (
              <button
                key={conv._id}
                className={classNames(
                  'w-full px-4 py-3 cursor-pointer hover:bg-gray-200 flex items-center text-left',
                  { 'bg-gray-200': selectedConversationId === conv._id }
                )}
                onClick={() => dispatch(selectConversation(conv._id))}
                aria-label={`Mở cuộc trò chuyện với ${
                  conv.isGroup ? conv.groupName : conv.participants[0].username
                }`}
              >
                <img
                  src={
                    conv.isGroup
                      ? conv.groupAvatar
                      : conv.participants[0].avatar
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex flex-col">
                  <span className="font-medium truncate">
                    {conv.isGroup
                      ? conv.groupName
                      : conv.participants[0].username}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-sm text-gray-500 truncate">
                      {conv.lastMessage.text || '📎 File'}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between p-3 border-b bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(selectConversation(null))}
                  aria-label="Quay lại danh sách cuộc trò chuyện"
                >
                  <ChevronLeft size={24} className="cursor-pointer" />
                </button>
                <User size={24} className="text-gray-700" />
                <span className="font-medium truncate">
                  {selectedConversation.isGroup
                    ? selectedConversation.groupName
                    : selectedConversation.participants[0].username}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  aria-label="Bắt đầu gọi điện"
                  className="focus:outline-none"
                >
                  <Phone
                    size={20}
                    className="cursor-pointer hover:text-blue-600"
                  />
                </button>
                <button
                  aria-label="Bắt đầu gọi video"
                  className="focus:outline-none"
                >
                  <Video
                    size={20}
                    className="cursor-pointer hover:text-blue-600"
                  />
                </button>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 bg-white space-y-2 scroll-smooth"
            >
              {loadingMessages ? (
                <div className="text-gray-500">Đang tải tin nhắn...</div>
              ) : selectedMessages.length === 0 ? (
                <div className="text-gray-500">Không có tin nhắn nào</div>
              ) : (
                selectedMessages.map((msg: Message) => {
                  const isMe = msg.sender._id === userId;
                  return (
                    <div
                      key={msg._id}
                      className={classNames('flex', {
                        'justify-end': isMe,
                        'justify-start': !isMe,
                      })}
                    >
                      <div
                        className={classNames(
                          'px-3 py-2 rounded-lg max-w-xs break-words',
                          isMe
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 border-t flex items-center gap-2 bg-gray-50">
              <button aria-label="Đính kèm tệp" className="focus:outline-none">
                <Paperclip
                  size={20}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                />
              </button>
              <button
                aria-label="Chọn biểu tượng cảm xúc"
                className="focus:outline-none"
              >
                <Smile
                  size={20}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                aria-label="Nhập tin nhắn"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className={classNames(
                  'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none',
                  { 'opacity-50 cursor-not-allowed': sendingMessage }
                )}
                aria-label="Gửi tin nhắn"
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Vui lòng chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
