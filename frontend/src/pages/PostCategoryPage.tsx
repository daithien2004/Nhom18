import { useEffect, useState } from "react";
import instance from "../api/axiosInstant";
import { Plus, MoreHorizontal, Share2 } from "lucide-react";

interface Author {
  username: string;
  avatar?: string;
}

interface ApiPost {
  _id: string;
  content: string;
  images: string[];
  author: Author;
  createdAt?: string;
}

interface ApiCategory {
  _id: string;
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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedCategory = categories.find(
    (c: ApiCategory) => c._id === selectedCategoryId
  );
  const selectedPosts = selectedCategory ? selectedCategory.posts : [];

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await instance.get("/post-categories/");
      const list = Array.isArray(data) ? (data as ApiCategory[]) : [];
      setCategories(list);
      if (list.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(list[0]._id);
      }
    } catch (err: any) {
      setError("Không thể tải danh mục. Vui lòng đăng nhập và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCategory = () => {
    setNewCategoryName("");
    setShowCreateModal(true);
  };

  const submitCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    try {
      const { data: created } = await instance.post("/post-categories/", {
        name: newCategoryName.trim(),
      });
      await loadCategories();
      if (created && created._id) {
        setSelectedCategoryId(created._id);
      }
      setShowCreateModal(false);
    } catch (err) {
      // no-op
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r bg-white p-4">
        <h2 className="text-lg font-bold mb-4">Đã lưu</h2>
        <p className="text-sm text-gray-500 mb-3">Mục đã lưu (của bạn)</p>

        {isLoading && <p className="text-sm text-gray-500">Đang tải...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-2">
          {categories.map((cat: ApiCategory) => (
            <div
              key={cat._id}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedCategoryId === cat._id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedCategoryId(cat._id)}
            >
              <img
                src={
                  cat.posts[0]?.images?.[0] || "https://via.placeholder.com/50"
                }
                alt={cat.name}
                className="w-10 h-10 rounded object-cover"
              />
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-gray-500">
                  {cat.posts.length} mục đã lưu
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateCategory}
          className="mt-4 flex items-center gap-2 px-3 py-2 w-full text-blue-600 rounded hover:bg-blue-50"
        >
          <Plus size={18} /> Tạo bộ sưu tập mới
        </button>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {selectedCategory?.name || "Tất cả"}
          </h2>
          <button
            onClick={loadCategories}
            className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Làm mới
          </button>
        </div>

        {!isLoading && !error && selectedPosts.length === 0 && (
          <p className="text-sm text-gray-500">Chưa có bài viết nào.</p>
        )}

        <div className="space-y-4">
          {selectedPosts.map((post: ApiPost) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow p-4 flex gap-4"
            >
              {/* Image */}
              <img
                src={post.images?.[0] || "https://via.placeholder.com/200x150"}
                alt={post.content?.slice(0, 20) || "post"}
                className="w-32 h-32 object-cover rounded"
              />

              {/* Content */}
              <div className="flex-1">
                <p className="font-semibold text-gray-800 line-clamp-2">
                  {post.content}
                </p>
                <p className="text-sm text-gray-500">
                  Tác giả: {post.author?.username || "Ẩn danh"}
                </p>
                <p className="text-xs text-gray-400">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleString()
                    : ""}
                </p>

                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                    Thêm vào bộ sưu tập
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100">
                    <Share2 size={16} />
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {/* Create Category Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white w-[520px] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b">
              <h3 className="text-xl font-bold">Tạo bộ sưu tập</h3>
            </div>
            <div className="px-5 py-4">
              <label className="block text-sm text-gray-600 mb-1">Tên</label>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Đặt tên cho bộ sưu tập của bạn..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-blue-600 rounded hover:bg-blue-50"
                disabled={isCreating}
              >
                Hủy
              </button>
              <button
                onClick={submitCreateCategory}
                disabled={!newCategoryName.trim() || isCreating}
                className={`px-4 py-2 rounded text-white ${
                  !newCategoryName.trim() || isCreating
                    ? "bg-gray-300"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isCreating ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCategoryPage;
