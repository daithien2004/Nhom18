import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { sharePost } from '../store/slices/postSlice';

interface SharePostModalProps {
  postId: string;
  username?: string;
  avatar?: string;
  onClose: () => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({
  postId,
  username,
  avatar,
  onClose,
}) => {
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleShare = async () => {
    if (!caption.trim()) return alert('Nhập caption trước khi chia sẻ!');
    setLoading(true);
    try {
      await dispatch(sharePost({ postId, caption })).unwrap();
      alert('Chia sẻ thành công!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Chia sẻ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* Overlay nền trắng mờ + blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal cố định giữa màn hình */}
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chia sẻ bài viết</h2>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="font-semibold text-gray-800">{username || 'Bạn'}</p>
        </div>

        {/* Caption input */}
        <textarea
          className="w-full border-none resize-none focus:ring-0 rounded-lg p-2 bg-gray-100"
          rows={4}
          placeholder="Hãy nói gì đó về nội dung này..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow transition flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Đang chia sẻ...' : 'Chia sẻ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
