import React from 'react';
import type { Notification } from '../types/notification';

interface Props {
  notif: Notification;
}

const NotificationItem: React.FC<Props> = ({ notif }) => {
  const { type, isRead, createdAt, metadata, senderId } = notif;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${
        isRead ? 'bg-white' : 'bg-blue-50'
      } hover:bg-gray-100`}
    >
      {/* Avatar người gửi */}
      <img
        src={senderId?.avatar || '/default-avatar.png'}
        alt="avatar"
        className="h-10 w-10 rounded-full"
      />

      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{metadata?.senderName}</span>{' '}
          {type === 'like' && 'đã thích bài viết của bạn'}
          {type === 'comment' && (
            <>
              đã bình luận:{' '}
              <span className="italic">"{metadata?.comment}"</span>
            </>
          )}
          {type === 'follow' && 'đã theo dõi bạn'}
          {type === 'share' && 'đã chia sẻ bài viết của bạn'}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>

      {/* Thumbnail bài viết nếu có */}
      {metadata?.postThumbnail && (
        <img
          src={metadata.postThumbnail}
          alt="post"
          className="h-10 w-10 rounded object-cover"
        />
      )}
    </div>
  );
};

export default NotificationItem;
