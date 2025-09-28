import React, { useEffect, useState, type JSX } from 'react';
import PostSection from '../components/PostSection';
import instance from '../api/axiosInstant';
import type { Post, Tab } from '../types/post';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createPost } from '../store/slices/postSlice';
import {
  Clock,
  Flame,
  ImageIcon,
  Loader2,
  Pin,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import NotificationDropdown from '../components/NotificationDropdown';
import { fetchProfile } from '../store/thunks/authThunks';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isCreating, createError } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  const [tab, setTab] = useState<Tab>('recent');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newPost, setNewPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State để quản lý modal

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Upload ảnh
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await instance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(res.data.url);
      } catch (err) {
        toast.error('Tải ảnh lên thất bại!');
        console.error('Lỗi khi upload ảnh:', err);
      }
    }
    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`Tải lên ${uploadedUrls.length} ảnh thành công!`);
    }
  };

  // Tạo post
  const handleCreatePost = async () => {
    if (!content && images.length === 0) return;

    try {
      const result = await dispatch(createPost({ content, images })).unwrap();
      setContent('');
      setImages([]);
      setNewPost(result);
      setIsModalOpen(false); // Đóng modal sau khi đăng bài thành công
      toast.success('Đăng bài thành công!');
    } catch (error) {
      toast.error('Đăng bài thất bại. Vui lòng thử lại!');
      console.error('Lỗi khi đăng bài:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center py-3 px-2">
        <h1 className="text-xl font-bold">Trang chủ</h1>
        <NotificationDropdown />
      </div>

      {/* Nút hoặc khu vực để mở modal */}
      <div className="bg-white p-4 rounded-2xl shadow-md cursor-pointer">
        <div className="flex space-x-3">
          <img
            src={user?.avatar || 'https://via.placeholder.com/48'}
            alt="User avatar"
            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
          />
          <div className="flex-1">
            <div
              className="w-full border-none rounded-lg p-2 bg-gray-100 text-gray-500"
              onClick={() => setIsModalOpen(true)}
            >
              Bạn đang nghĩ gì thế?
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 min-h-screen flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Tạo bài viết</h2>
            <div className="flex flex-col space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì thế?"
                className="w-full border-none resize-none focus:ring-0 rounded-lg p-2 bg-gray-100"
                rows={4}
              />
              <div className="flex justify-between items-center">
                <label htmlFor="file-upload" className="inline-block">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100 transition-all duration-300">
                    <ImageIcon size={20} className="text-blue-600" />
                    <span className="text-sm font-semibold">Thêm ảnh</span>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 bg-gray-800 bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {createError && (
                <div className="text-red-500 text-sm">{createError}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={isCreating || (!content && images.length === 0)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating && <Loader2 className="animate-spin w-4 h-4" />}
                  {isCreating ? 'Đang đăng...' : 'Đăng bài'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-6">
        {(['recent', 'hot', 'popular', 'pinned'] as Tab[]).map((t) => {
          const icons: Record<Tab, JSX.Element> = {
            recent: <Clock size={16} />,
            hot: <Flame size={16} />,
            popular: <TrendingUp size={16} />,
            pinned: <Pin size={16} />,
          };

          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-2 inline-flex items-center gap-1.5 text-sm font-medium transition ${
                tab === t
                  ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-600'
                  : 'text-gray-800 hover:text-blue-500'
              }`}
            >
              {icons[t]}
              {t === 'recent'
                ? 'Mới nhất'
                : t === 'hot'
                ? 'Hot'
                : t === 'popular'
                ? 'Xem nhiều'
                : 'Đáng chú ý'}
            </button>
          );
        })}
      </div>

      {/* Section posts */}
      <PostSection tab={tab} newPost={newPost} />
    </div>
  );
};

export default HomePage;
