import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import classNames from 'classnames';
import { ChevronLeft, Loader2 } from 'lucide-react';
import {
  fetchConversations,
  selectConversation,
} from '../store/slices/conversationSlice';
import type { Conversation } from '../types/message';
import ChatWindow from '../components/ChatWindow';

const ConversationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, selectedConversationId, loadingConversations } =
    useAppSelector((state) => state.conversations);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConversationId) {
      scrollToBottom();
    }
  }, [selectedConversationId]);

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
              <div ref={scrollRef}>
                <ChatWindow
                  user={{
                    id: selectedConversation.participants[0].id,
                    username: selectedConversation.participants[0].username,
                    avatar: selectedConversation.participants[0].avatar,
                    status:
                      selectedConversation.participants[0].status || 'none',
                    isOnline: selectedConversation.participants[0].isOnline,
                  }}
                  conversationId={selectedConversation.id}
                  chatStatus={selectedConversation.status || 'active'} // Adjust based on your conversation status logic
                />
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
