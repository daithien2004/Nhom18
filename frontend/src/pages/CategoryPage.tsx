import { useEffect, useState } from 'react';
import instance from '../api/axiosInstant';
import { Plus, MoreHorizontal, Share2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Author {
  username: string;
  avatar?: string;
}

interface ApiPost {
  id: string;
  content: string;
  images: string[];
  author: Author;
  createdAt?: string;
}

interface ApiCategory {
  id: string;
  name: string;
  posts: ApiPost[];
}

const PostCategoryPage = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedCategory = categories.find(
    (c: ApiCategory) => c.id === selectedCategoryId
  );
  const selectedPosts = selectedCategory ? selectedCategory.posts : [];

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await instance.get('/categories/');
      const list = Array.isArray(data) ? (data as ApiCategory[]) : [];
      setCategories(list);
      if (list.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(list[0].id);
      }
    } catch (err: any) {
      setError('Không thể tải danh mục. Vui lòng đăng nhập và thử lại.');
      toast.error('Không thể tải danh mục!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = () => {
    setNewCategoryName('');
    setShowCreateModal(true);
  };

  const submitCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    try {
      const { data: created } = await instance.post('/categories/', {
        name: newCategoryName.trim(),
      });
      await loadCategories();
      if (created && created.id) {
        setSelectedCategoryId(created.id);
      }
      setShowCreateModal(false);
      toast.success('Tạo bộ sưu tập thành công!');
    } catch (err) {
      toast.error('Tạo bộ sưu tập thất bại!');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex bg-white">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white fixed h-screen shadow-md p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Đã lưu</h2>
        <p className="text-sm text-gray-500 mb-6">Mục đã lưu (của bạn)</p>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin w-4 h-4" />
            Đang tải...
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-3 flex-1">
          {categories.map((cat: ApiCategory) => (
            <div
              key={cat.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 ${
                selectedCategoryId === cat.id
                  ? 'bg-gray-100 text-blue-600'
                  : 'text-gray-800'
              }`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <img
                src={
                  cat.posts[0]?.images?.[0] || 'https://via.placeholder.com/48'
                }
                alt={cat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{cat.name}</p>
                <p className="text-xs text-gray-500">
                  {cat.posts.length} mục đã lưu
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateCategory}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
        >
          <Plus size={18} />
          <span className="text-sm font-semibold">Tạo bộ sưu tập mới</span>
        </button>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedCategory?.name || 'Tất cả'}
            </h2>
            <button
              onClick={loadCategories}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              Làm mới
            </button>
          </div>

          {!isLoading && !error && selectedPosts.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có bài viết nào.</p>
          )}

          <div className="space-y-6">
            {selectedPosts.map((post: ApiPost) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md p-4 flex gap-4"
              >
                {/* Image */}
                <img
                  src={
                    post.images?.[0] || 'https://via.placeholder.com/200x150'
                  }
                  alt={post.content?.slice(0, 20) || 'post'}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-gray-800 line-clamp-2">
                    {post.content}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tác giả: {post.author?.username || 'Ẩn danh'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ''}
                  </p>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300">
                      Thêm vào bộ sưu tập
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300">
                      <Share2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300">
                      <MoreHorizontal size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Tạo bộ sưu tập</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tên
                </label>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Đặt tên cho bộ sưu tập của bạn..."
                  className="w-full px-3 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  disabled={isCreating}
                >
                  Hủy
                </button>
                <button
                  onClick={submitCreateCategory}
                  disabled={!newCategoryName.trim() || isCreating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating && <Loader2 className="animate-spin w-4 h-4" />}
                  {isCreating ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCategoryPage;
