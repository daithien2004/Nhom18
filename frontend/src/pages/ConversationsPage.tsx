import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import classNames from 'classnames';
import { Loader2 } from 'lucide-react';
import {
  fetchConversations,
  selectConversation,
} from '../store/slices/conversationSlice';
import type { Conversation } from '../types/message';
import ChatWindow from '../components/ChatWindow';

const ConversationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { conversations, selectedConversationId, loadingConversations } =
    useAppSelector((state) => state.conversations);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Function to check if conversation has unread messages
  const hasUnreadMessages = (conv: Conversation): boolean => {
    if (!conv.lastMessage || !currentUser) return false;

    // Check if current user has read the last message
    const isRead = conv.lastMessage.readBy?.includes(currentUser.id);
    const isOwnMessage = conv.lastMessage.sender.id === currentUser.id;

    // If it's not our message and we haven't read it, it's unread
    return !isOwnMessage && !isRead;
  };

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

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
            conversations.map((conv: Conversation) => {
              const hasUnread = hasUnreadMessages(conv);

              return (
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
                    conv.isGroup
                      ? conv.groupName
                      : conv.participants[0].username
                  }`}
                >
                  <div className="relative mr-3">
                    <img
                      src={
                        conv.isGroup
                          ? conv.groupAvatar || '/group.png'
                          : conv.participants.find(
                              (p) => p.id !== currentUser!.id
                            )?.avatar || 'https://via.placeholder.com/48'
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {hasUnread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className={classNames(
                        'text-sm truncate',
                        hasUnread
                          ? 'font-bold text-gray-900'
                          : 'font-semibold text-gray-800'
                      )}
                    >
                      {conv.isGroup
                        ? conv.groupName
                        : conv.participants.find(
                            (p) => p.id !== currentUser!.id
                          )?.username}
                    </span>
                    {conv.lastMessage && (
                      <span
                        className={classNames(
                          'text-xs truncate',
                          hasUnread
                            ? 'font-semibold text-gray-700'
                            : 'text-gray-500'
                        )}
                      >
                        {conv.lastMessage.text || '📎 File'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} />
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
