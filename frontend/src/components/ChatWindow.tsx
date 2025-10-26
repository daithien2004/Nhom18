import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOutgoingRequests } from '../store/slices/friendSlice';
import {
  fetchMessages,
  selectConversation,
  fetchConversationSettings,
  updateConversationSettings,
  addMessageReaction,
  updateMessageStatus,
} from '../store/slices/conversationSlice';
import { Loader2 } from 'lucide-react';
import { type EmojiClickData } from 'emoji-picker-react';
import type { Conversation } from '../types/message';
import MessageItem from './MessageItem';
import ChatHeader from './ChatHeader';
import InputBox from './InputBox';

// Danh sách emoji cảm xúc
const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ChatWindowProps {
  conversation: Conversation;
}

export default function ChatWindow({ conversation }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const { hasMore, isLoadingMore, messages, initialLoading } = useAppSelector(
    (state) => state.conversations
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null);
  const [isChoosingCustomEmoji, setIsChoosingCustomEmoji] = useState(false);
  const [page, setPage] = useState(1);

  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const settings = useAppSelector(
    (state) => state.conversations.settings[conversation.id]
  ) || {
    theme: 'bg-gray-50',
    customEmoji: '👍',
    notificationsEnabled: true,
  };

  // Tạo user object cho ChatHeader (thống nhất cho cá nhân và nhóm)
  const user = conversation.isGroup
    ? {
        id: conversation.id,
        username: conversation.groupName || 'Nhóm chat',
        avatar: conversation.groupAvatar || '/group.png',
        status: 'active' as const,
        isGroup: true,
      }
    : {
        id:
          conversation.participants.find((p) => p.id !== currentUser?.id)?.id ||
          '',
        username:
          conversation.participants.find((p) => p.id !== currentUser?.id)
            ?.username || 'Unknown',
        avatar:
          conversation.participants.find((p) => p.id !== currentUser?.id)
            ?.avatar || 'https://via.placeholder.com/48',
        status: conversation.status || 'none',
        isOnline: conversation.participants.find(
          (p) => p.id !== currentUser?.id
        )?.isOnline,
        isGroup: false,
      };

  // ==================== HANDLERS ====================

  // Xử lý chọn emoji tùy chỉnh
  const handleCustomEmojiClick = (emojiData: EmojiClickData) => {
    dispatch(
      updateConversationSettings({
        conversationId: conversation.id,
        settings: { customEmoji: emojiData.emoji },
      })
    );
    setIsChoosingCustomEmoji(false);
    setShowEmojiPicker(false);
    setShowSettingsMenu(false);
  };

  // Xử lý gỡ emoji tùy chỉnh
  const handleResetEmoji = () => {
    dispatch(
      updateConversationSettings({
        conversationId: conversation.id,
        settings: { customEmoji: '👍' },
      })
    );
    setShowSettingsMenu(false);
  };

  // Xử lý đổi chủ đề
  const handleChangeTheme = (themeValue: string) => {
    dispatch(
      updateConversationSettings({
        conversationId: conversation.id,
        settings: { theme: themeValue },
      })
    );
    setShowSettingsMenu(false);
  };

  // Xử lý bật/tắt thông báo
  const handleToggleNotifications = () => {
    dispatch(
      updateConversationSettings({
        conversationId: conversation.id,
        settings: { notificationsEnabled: !settings.notificationsEnabled },
      })
    );
    setShowSettingsMenu(false);
  };

  // Xử lý chọn phản ứng
  const handleReactionClick = (messageId: string, emoji: string) => {
    if (currentUser) {
      dispatch(
        addMessageReaction({
          conversationId: conversation.id,
          messageId,
          userId: currentUser.id,
          emoji,
        })
      );
    }
    setShowReactionMenu(null);
  };

  // Xử lý click vào tin nhắn
  const handleMessageClick = (messageId: string | null) => {
    setShowReactionMenu(messageId);
  };

  // Xử lý click vào ảnh đính kèm
  const handleAttachmentClick = (attachment: string) => {
    window.open(attachment, '_blank');
  };

  // ==================== EFFECTS ====================

  // Đóng menu cảm xúc khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionMenuRef.current &&
        !reactionMenuRef.current.contains(event.target as Node)
      ) {
        setShowReactionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch outgoing requests
  useEffect(() => {
    dispatch(fetchOutgoingRequests());
  }, [dispatch]);

  // Fetch messages khi conversation thay đổi
  useEffect(() => {
    if (conversation.id) {
      dispatch(selectConversation(conversation.id));
      dispatch(
        fetchMessages({ conversationId: conversation.id, limit: 10, page: 1 })
      );
      dispatch(fetchConversationSettings(conversation.id));
      setPage(1);
    }
  }, [conversation.id, dispatch]);

  // Intersection Observer cho "seen" status
  useEffect(() => {
    if (!currentUser || !conversation.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            const message = messages[conversation.id]?.find(
              (m) => m.id === messageId
            );
            if (
              messageId &&
              message &&
              message.sender.id !== currentUser.id &&
              !message.readBy.includes(currentUser.id)
            ) {
              dispatch(
                updateMessageStatus({
                  conversationId: conversation.id,
                  messageId,
                  status: 'seen',
                })
              );
            }
          }
        });
      },
      {
        root: messagesContainerRef.current,
        threshold: 0.5,
      }
    );

    Object.values(messageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(messageRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [messages[conversation.id], currentUser, conversation.id, dispatch]);

  // Intersection Observer cho load more messages
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !initialLoading
        ) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.1,
        root: messagesContainerRef.current,
        rootMargin: '100px',
      }
    );

    const currentRef = messagesEndRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, initialLoading]);

  // Fetch messages khi page thay đổi
  useEffect(() => {
    if (conversation.id && page > 1) {
      const container = messagesContainerRef.current;
      if (!container) return;

      const scrollHeightBefore = container.scrollHeight;
      const scrollTopBefore = container.scrollTop;

      dispatch(
        fetchMessages({ conversationId: conversation.id, limit: 10, page })
      ).then(() => {
        requestAnimationFrame(() => {
          if (container) {
            const scrollHeightAfter = container.scrollHeight;
            const addedHeight = scrollHeightAfter - scrollHeightBefore;
            container.scrollTop = scrollTopBefore + addedHeight;
          }
        });
      });
    }
  }, [page, conversation.id, dispatch]);

  // Scroll xuống cuối khi load lần đầu hoặc có tin nhắn mới
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (page === 1 && !initialLoading && !isLoadingMore) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages[conversation.id], page, initialLoading, isLoadingMore]);

  // ==================== RENDER ====================

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md max-h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <ChatHeader
        user={user}
        conversationId={conversation.id}
        settings={settings}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        setShowEmojiPicker={setShowEmojiPicker}
        setIsChoosingCustomEmoji={setIsChoosingCustomEmoji}
        handleChangeTheme={handleChangeTheme}
        handleToggleNotifications={handleToggleNotifications}
        handleResetEmoji={handleResetEmoji}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 p-4 overflow-y-auto space-y-3 ${settings.theme} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
      >
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {hasMore && (
              <div ref={messagesEndRef} className="h-1">
                {isLoadingMore && (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />
                  </div>
                )}
              </div>
            )}

            {messages[conversation.id]?.length > 0 ? (
              messages[conversation.id].map((msg, index) => {
                const nextMsg = messages[conversation.id][index + 1];
                const showAvatar =
                  !nextMsg || nextMsg.sender.id !== msg.sender.id;

                const myMessages = messages[conversation.id].filter(
                  (m) => m.sender.id === currentUser?.id
                );
                const latestSeenMessage = myMessages
                  .filter((m) => m.status === 'seen')
                  .pop();
                const showSeenStatus = latestSeenMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    ref={(el) => {
                      messageRefs.current[index] = el;
                    }}
                    data-message-id={msg.id}
                  >
                    <MessageItem
                      message={msg}
                      currentUserId={currentUser?.id}
                      showReactionMenu={showReactionMenu}
                      reactionEmojis={reactionEmojis}
                      onMessageClick={handleMessageClick}
                      onReactionClick={handleReactionClick}
                      onAttachmentClick={handleAttachmentClick}
                      showAvatar={showAvatar}
                      showSeenStatus={showSeenStatus}
                      participants={conversation.participants}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-gray-500 mt-5">
                Không có tin nhắn nào trong cuộc trò chuyện này.
              </div>
            )}

            {!conversation.isGroup && conversation.status === 'pending' && (
              <div className="text-center text-sm text-gray-500 mt-5 italic">
                Tin nhắn này đang chờ cho đến khi {user.username} chấp nhận kết
                bạn
              </div>
            )}
          </>
        )}
      </div>

      {/* Input box */}
      <InputBox
        conversationId={conversation.id}
        settings={settings}
        currentUser={currentUser}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        isChoosingCustomEmoji={isChoosingCustomEmoji}
        handleCustomEmojiClick={handleCustomEmojiClick}
      />
    </div>
  );
}
