import { useEffect, useState } from "react";
import instance from "../api/axiosInstant";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";

interface SavePostModalProps {
  postId: string;
  onClose: () => void;
  onSaved?: () => void; // 👈 thêm callback tùy chọn
}

const SavePostModal = ({ postId, onClose, onSaved }: SavePostModalProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => setSelected(""), [postId]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await instance.get("/categories/");
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setError("Không thể tải danh mục. Hãy đăng nhập.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data: created } = await instance.post("/categories/", {
        name: newName.trim(),
      });
      const { data } = await instance.get("/categories/");
      setCategories(Array.isArray(data) ? data : []);
      if (created?.id) setSelected(created.id);
      setShowCreate(false);
      setNewName("");
      toast.success("Tạo bộ sưu tập mới thành công!");
    } catch {
      toast.error("Không thể tạo bộ sưu tập");
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await instance.post(`/categories/${selected}/posts`, { postId });
      toast.success("Đã lưu bài viết vào danh mục!");
      if (onSaved) onSaved(); // 👈 reload ngay sau khi lưu
      onClose();
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại!");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        {/* Modal chính */}
        <div
          className="bg-white w-[420px] rounded-2xl shadow-xl p-6 relative transition-all duration-300 animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Lưu vào</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {loading && (
              <p className="text-sm text-gray-500 px-2">Đang tải danh mục...</p>
            )}
            {error && <p className="text-sm text-red-600 px-2">{error}</p>}

            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selected === cat.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      cat.posts?.[0]?.images?.[0] ||
                      "https://cdn-icons-png.flaticon.com/512/833/833281.png"
                    }
                    alt={cat.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500">Chỉ mình tôi</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="category"
                  checked={selected === cat.id}
                  onChange={() => setSelected(cat.id)}
                  className="accent-blue-600"
                />
              </div>
            ))}

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 p-2 w-full text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Plus size={18} /> <span>Tạo bộ sưu tập mới</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!selected}
              className={`px-5 py-2 rounded-lg font-medium text-white transition-all duration-300 ${
                !selected
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>

      {/* Modal tạo mới */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white w-[460px] rounded-2xl shadow-xl animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Tạo bộ sưu tập
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <label className="block text-sm text-gray-600 mb-2">
                Tên bộ sưu tập
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nhập tên bộ sưu tập..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                disabled={creating}
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 ${
                  !newName.trim() || creating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {creating ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SavePostModal;
