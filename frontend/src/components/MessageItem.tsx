import { useEffect, useRef } from 'react';
import type { ChatUser, Message } from '../types/message';

interface MessageItemProps {
  message: Message;
  currentUserId: string | undefined;
  showReactionMenu: string | null;
  reactionEmojis: string[];
  onMessageClick: (messageId: string | null) => void;
  onReactionClick: (messageId: string, emoji: string) => void;
  onAttachmentClick: (attachment: string) => void;
  showAvatar?: boolean;
  showSeenStatus?: boolean;
  participants?: ChatUser[];
}

export default function MessageItem({
  message,
  currentUserId,
  showReactionMenu,
  reactionEmojis,
  onMessageClick,
  onReactionClick,
  onAttachmentClick,
  showAvatar = true,
  showSeenStatus,
  participants,
}: MessageItemProps) {
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = message.sender.id === currentUserId;

  // Hàm tính toán số lượng mỗi emoji
  const getReactionCounts = () => {
    const counts: { [emoji: string]: number } = {};
    Object.values(message.reactions || {}).forEach((emoji) => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return counts;
  };

  const renderSentStatus = () => (
    <div className="flex items-center justify-end mt-0.5 text-xs text-gray-400">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
      </svg>
      Đã gửi
    </div>
  );

  const renderDeliveredStatus = () => (
    <div className="flex items-center justify-end mt-0.5 text-xs text-gray-400">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        <path d="M15 16.2L10.8 12l-1.4 1.4L15 19 27 7l-1.4-1.4L15 16.2z" />
      </svg>
      Đã nhận
    </div>
  );

  const renderSeenStatus = (
    participants: ChatUser[] | undefined,
    message: Message,
    currentUserId: string | undefined
  ) => {
    if (!participants) {
      // Chat 1-1
      return (
        <div className="flex items-center justify-end mt-0.5">
          <img
            src={message.sender.avatar || '/default-avatar.png'}
            alt={message.sender.username}
            className="w-3.5 h-3.5 rounded-full object-cover border border-white"
          />
        </div>
      );
    }

    // Chat nhóm
    const seenParticipants = participants.filter(
      (p) => message.readBy.includes(p.id) && p.id !== currentUserId
    );

    return (
      <div className="flex items-center justify-end mt-0.5 space-x-0.5">
        {seenParticipants.map((user, index) => (
          <img
            key={index}
            src={user.avatar || '/default-avatar.png'}
            alt={user.username}
            className="w-3.5 h-3.5 rounded-full object-cover border border-white"
          />
        ))}
      </div>
    );
  };

  const renderMessageStatus = (
    message: Message,
    isOwnMessage: boolean,
    showSeenStatus: boolean,
    participants: ChatUser[] | undefined,
    currentUserId: string | undefined
  ) => {
    if (!isOwnMessage) return null;

    if (message.status === 'sent') return renderSentStatus();
    if (message.status === 'delivered') return renderDeliveredStatus();
    if (message.status === 'seen' && showSeenStatus)
      return renderSeenStatus(participants, message, currentUserId);

    return null;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Nếu menu đang mở và click KHÔNG nằm trong menu
      if (
        reactionMenuRef.current &&
        !reactionMenuRef.current.contains(event.target as Node)
      ) {
        onMessageClick(null); // ẩn menu
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onMessageClick]);

  return (
    <div
      className={`flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } relative group items-end gap-1.5 py-1 px-3`}
    >
      {/* Avatar cho tin nhắn từ người khác */}
      <div className="w-6 h-6 flex-shrink-0 mt-auto">
        {
          !isOwnMessage && showAvatar ? (
            <img
              src={message.sender.avatar || '/default-avatar.png'}
              alt={message.sender.username}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : null /* vẫn giữ div để căn hàng */
        }
      </div>

      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? 'items-end' : 'items-start'
        } group-hover:opacity-90 transition-all duration-200`}
      >
        {/* Bong bóng tin nhắn */}
        <div
          className={`px-3 py-2 rounded-2xl shadow-sm ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-[4px]'
              : 'bg-gray-200 text-gray-800 rounded-bl-[4px]'
          } transition-all duration-200 cursor-pointer`}
        >
          {message.text && (
            <div
              className="text-sm leading-relaxed"
              onClick={() => onMessageClick(message.id)}
            >
              {message.text}
            </div>
          )}

          {(message.attachments ?? []).length > 0 && (
            <div className="mt-1.5 space-y-1.5">
              {message.attachments?.map((attachment, index) => (
                <img
                  key={index}
                  src={attachment}
                  alt={`Ảnh đính kèm ${index + 1}`}
                  className="max-w-[200px] h-auto rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttachmentClick(attachment);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Hiển thị phản ứng */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div
            className={`flex flex-row mt-0.5 bg-white rounded-full px-2 py-0.5 text-sm shadow-sm border border-gray-200 ${
              isOwnMessage ? 'mr-1' : 'ml-1'
            }`}
          >
            {Object.entries(getReactionCounts()).map(([emoji, count]) => (
              <span key={emoji} className="flex items-center gap-1">
                {emoji}
                {count > 1 && (
                  <span className="text-xs text-gray-600">{count}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Hiển thị trạng thái tin nhắn */}
        {renderMessageStatus(
          message,
          isOwnMessage,
          showSeenStatus ?? false,
          participants,
          currentUserId
        )}
      </div>

      {/* Menu phản ứng */}
      {showReactionMenu === message.id && (
        <div
          ref={reactionMenuRef}
          className={`absolute -top-10 ${
            isOwnMessage ? 'right-0' : 'left-0'
          } bg-white rounded-full shadow-lg p-2 flex gap-1.5 z-10 border border-gray-200`}
        >
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onReactionClick(message.id, emoji);
              }}
              className="text-base hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
