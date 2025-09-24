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
      {/* Overlay nền trắng mờ + blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal cố định giữa màn hình */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-5 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chia sẻ bài viết</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="font-semibold text-gray-900">{username || 'Bạn'}</p>
        </div>

        {/* Caption input */}
        <textarea
          className="w-full border border-gray-300 rounded-2xl p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          rows={4}
          placeholder="Hãy nói gì đó về nội dung này..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center cursor-pointer"
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
