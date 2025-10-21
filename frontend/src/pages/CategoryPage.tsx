import { useEffect, useState } from "react";
import instance from "../api/axiosInstant";
import { Plus, Share2, Loader2, Trash2, Eye, FolderX } from "lucide-react";
import { toast } from "react-toastify";
import SavePostModal from "../components/SavePostModal";
import SharePostModal from "../components/SharePostModal";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface Author {
  username: string;
  avatar?: string;
}

interface ApiPost {
  id: string;
  content?: string;
  caption?: string;
  images?: string[];
  author: Author;
  createdAt?: string;
  sharedFrom?: ApiPost | null; // 👈 Thêm field bài gốc nếu là bài chia sẻ
}

interface ApiCategory {
  id: string;
  name: string;
  posts: ApiPost[];
}

interface User {
  username: string;
  avatar: string;
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [shareUser, setShareUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const selectedCategory = categories.find(
    (c: ApiCategory) => c.id === selectedCategoryId
  );
  const selectedPosts = selectedCategory ? selectedCategory.posts : [];

  // Load danh mục
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await instance.get("/categories/");
      const list = Array.isArray(data) ? (data as ApiCategory[]) : [];
      setCategories(list);
      if (list.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(list[0].id);
      }
    } catch (err: any) {
      setError("Không thể tải danh mục. Vui lòng đăng nhập và thử lại.");
      toast.error("Không thể tải danh mục!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const deletePost = async (cateId: string | null, postId: string) => {
    try {
      await instance.delete(`/categories/${cateId}/posts/${postId}`);
      loadCategories();
      toast.success("Xóa bài viết khỏi danh mục thành công!");
    } catch (error) {
      toast.error("Không thể xóa bài viết");
    }
  };

  const removeAllPosts = async (cateId: string | null) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa tất cả bài viết trong danh mục này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;
    try {
      await instance.delete(`/categories/${cateId}/posts`);
      toast.success("Đã xóa tất cả bài viết!");
      loadCategories();
    } catch {
      toast.error("Không thể xóa tất cả bài viết!");
    }
  };

  const deleteCategory = async (cateId: string | null) => {
    if (!cateId) return;
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa bộ sưu tập này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      await instance.delete(`/categories/${cateId}`);
      toast.success("Đã xóa bộ sưu tập!");
      loadCategories();
      setSelectedCategoryId(null);
    } catch {
      toast.error("Không thể xóa bộ sưu tập!");
    }
  };

  const handleCreateCategory = () => {
    setNewCategoryName("");
    setShowCreateModal(true);
  };

  const submitCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    try {
      const { data: created } = await instance.post("/categories/", {
        name: newCategoryName.trim(),
      });
      await loadCategories();
      if (created && created.id) {
        setSelectedCategoryId(created.id);
      }
      setShowCreateModal(false);
      toast.success("Tạo bộ sưu tập thành công!");
    } catch (err) {
      toast.error("Tạo bộ sưu tập thất bại!");
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

        <div className="space-y-3 flex-1 overflow-y-auto">
          {categories.map((cat: ApiCategory) => (
            <div
              key={cat.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 ${
                selectedCategoryId === cat.id
                  ? "bg-gray-100 text-blue-600"
                  : "text-gray-800"
              }`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <img
                src={
                  cat.posts[0]?.images?.[0] ||
                  "https://cdn-icons-png.flaticon.com/512/833/833281.png"
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
              {selectedCategory?.name || "Tất cả"}
            </h2>
            {selectedCategory && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => removeAllPosts(selectedCategoryId)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg 
                 border border-gray-300 text-gray-700 
                 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 
                 transition-all duration-200"
                >
                  <FolderX size={16} />
                  <span>Xóa tất cả</span>
                </button>

                <button
                  onClick={() => deleteCategory(selectedCategoryId)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg 
                 border border-red-300 text-red-600 
                 hover:bg-red-50 hover:border-red-400 hover:text-red-700 
                 transition-all duration-200"
                >
                  <Trash2 size={16} />
                  <span>Xóa danh mục</span>
                </button>
              </div>
            )}
          </div>

          {!isLoading && !error && selectedPosts.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có bài viết nào.</p>
          )}

          <div className="space-y-6">
            {selectedPosts.map((post: ApiPost) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 border"
              >
                {/* Image */}
                <img
                  src={
                    post.images?.[0] ||
                    post.sharedFrom?.images?.[0] ||
                    "https://via.placeholder.com/200x150"
                  }
                  alt={post.content?.slice(0, 20) || "post"}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-gray-800 line-clamp-2">
                    {post.content || post.caption}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tác giả: {post.author?.username || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ""}
                  </p>

                  {/* Nếu là bài chia sẻ */}
                  {post.sharedFrom && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">
                        🔁 Chia sẻ từ {post.sharedFrom.author?.username}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {post.sharedFrom.content ||
                          post.sharedFrom.caption ||
                          "Không có nội dung"}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setShowSaveModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300"
                    >
                      Thêm vào bộ sưu tập
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharePostId(post.id);
                        setShowShareModal(true);
                        setShareUser({
                          username: post.author.username,
                          avatar: post.author.avatar || "/default-avatar.png",
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                      title="Chia sẻ"
                    >
                      <Share2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                      onClick={() => deletePost(selectedCategoryId, post.id)}
                      title="Xóa"
                    >
                      <Trash2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                      title="Xem"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <Eye size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showSaveModal && selectedPostId && (
            <SavePostModal
              postId={selectedPostId}
              onClose={() => {
                setShowSaveModal(false);
                setSelectedPostId(null);
              }}
              onSaved={loadCategories}
            />
          )}

          {showShareModal && sharePostId && (
            <SharePostModal
              postId={sharePostId}
              username={shareUser?.username}
              avatar={shareUser?.avatar}
              onClose={() => {
                setShowShareModal(false);
                setSharePostId(null);
              }}
            />
          )}
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
                  {isCreating ? "Đang tạo..." : "Tạo"}
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
