import React from 'react';
import type { Notification } from '../types/notification';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { markNotificationAsRead } from '../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

interface Props {
  notif: Notification;
}

const NotificationItem: React.FC<Props> = ({ notif }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { type, isRead, createdAt, metadata, senderId, message } = notif; // Sử dụng message đã generate

  // Icon cho từng type
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'share':
        return <Share2 className="h-5 w-5 text-purple-500" />;
      case 'tag':
        return <Tag className="h-5 w-5 text-orange-500" />;
      case 'security':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  // Link đến post nếu có
  const postLink = metadata?.postId ? `/posts/${metadata.postId}` : null;

  const handleOpen = async () => {
    if (!isRead) {
      await dispatch(markNotificationAsRead(notif.id)).unwrap();
    }
    if (postLink) {
      navigate(postLink);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${
        isRead ? 'bg-white' : 'bg-blue-50'
      } hover:bg-gray-100 transition-colors`}
      onClick={handleOpen} // Click để mở post
    >
      {/* Chấm xanh nếu chưa đọc */}
      {!isRead && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full"></div>
      )}

      {/* Icon type */}
      <div className="flex-shrink-0 mt-1">{getIcon(type)}</div>

      {/* Avatar */}
      <img
        src={senderId?.avatar || '/default-avatar.png'}
        alt="avatar"
        className="h-10 w-10 rounded-full flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {message} {/* Message chi tiết đã generate */}
        </p>
        {metadata?.postTitle && (
          <p className="text-xs text-gray-600 italic mt-1">
            "{metadata.postTitle}"
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {new Date(createdAt).toLocaleString('vi-VN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Thumbnail nếu có */}
      {metadata?.postThumbnail && (
        <img
          src={metadata.postThumbnail}
          alt="post preview"
          className="h-12 w-12 rounded object-cover flex-shrink-0 ml-2"
        />
      )}
    </div>
  );
};

export default NotificationItem;
