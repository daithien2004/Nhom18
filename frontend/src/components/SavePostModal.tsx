import { useEffect, useState } from "react";
import instance from "../api/axiosInstant";
import { useNavigate } from "react-router-dom";

interface SavePostModalProps {
  postId: string;
  onClose: () => void;
}

const SavePostModal = ({ postId, onClose }: SavePostModalProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // reset state mỗi khi postId thay đổi
    setSelected("");
  }, [postId]);

  useEffect(() => {
    instance
      .get("/post-categories/")
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  const handleSave = () => {
    if (!selected) return;
    instance
      .post(`/post-categories/${selected}/save-post`, { postId })
      .then(() => {
        alert("Đã lưu bài viết vào danh mục!");
        onClose();
      })
      .catch((err) => console.error("Lỗi khi lưu:", err));
  };
  const handleClose = () => {
    console.log("❌ Modal close clicked");
    if (onClose) {
      console.log("🔹 onClose được gọi");
      onClose();
    }
    console.log("🔹 Quay về danh sách bài viết");
    navigate("/posts"); // giờ thì route này tồn tại
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Lưu vào</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={cat._id}
                checked={selected === cat._id}
                onChange={() => setSelected(cat._id)}
              />
              <span>{cat.name}</span>
            </label>
          ))}

          <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
            ➕ Bộ sưu tập mới
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePostModal;
