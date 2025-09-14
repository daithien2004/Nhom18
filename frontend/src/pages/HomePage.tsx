import React, { useState, type JSX } from 'react';
import PostSection from '../components/PostSection';
import instance from '../api/axiosInstant';
import type { Tab } from '../types/post';
import {
  Clock,
  Flame,
  ImageIcon,
  Loader2,
  Pin,
  TrendingUp,
  UserCircle,
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('recent');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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
        console.error('Lỗi khi upload ảnh:', err);
      }
    }
    setImages((prev) => [...prev, ...uploadedUrls]);
  };

  // Tạo post
  const handleCreatePost = async () => {
    if (!content && images.length === 0) return;
    try {
      setUploading(true);
      await instance.post('/posts', { content, images });
      setContent('');
      setImages([]);
      // Reload tab hiện tại
    } catch (error) {
      console.error('Lỗi khi đăng bài:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Form tạo post */}
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <div className="flex space-x-3">
          <UserCircle
            color="black"
            size={48}
            className="text-white cursor-pointer hover:scale-110 transition-transform"
          />
          {/* Textarea + Upload */}
          <div className="flex flex-col flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì thế?"
              className="w-full border-none resize-none focus:ring-0 rounded-lg p-2 bg-gray-100"
              rows={3}
            />
            {/* Upload ảnh */}
            <div className="mt-2 flex flex-col space-y-2">
              <label htmlFor="file-upload" className="inline-block">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 transition">
                  <ImageIcon size={20} className="text-green-500" />
                  <span className="text-sm font-medium">Ảnh</span>
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
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
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
            </div>
          </div>
        </div>

        <div className="mt-2 text-right">
          <button
            onClick={handleCreatePost}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-2 py-1 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading && <Loader2 className="animate-spin w-4 h-4" />}
            {uploading ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </div>

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
                  : 'text-gray-600 hover:text-blue-500'
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
      <PostSection tab={tab} />
    </div>
  );
};
export default HomePage;
