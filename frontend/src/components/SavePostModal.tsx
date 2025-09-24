import { useEffect, useState } from 'react';
import instance from '../api/axiosInstant';

interface SavePostModalProps {
  postId: string;
  onClose: () => void;
}

const SavePostModal = ({ postId, onClose }: SavePostModalProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // reset state mỗi khi postId thay đổi
    setSelected('');
  }, [postId]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await instance.get('/categories/');
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải danh mục. Hãy đăng nhập.');
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
      const { data: created } = await instance.post('/categories/', {
        name: newName.trim(),
      });
      // refresh list and preselect newly created
      const { data } = await instance.get('/categories/');
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      if (created && created.id) setSelected(created.id);
      setShowCreate(false);
      setNewName('');
    } catch (err) {
      // no-op
    } finally {
      setCreating(false);
    }
  };

  const handleSave = () => {
    if (!selected) return;
    instance
      .post(`/categories/${selected}/posts`, { postId })
      .then(() => {
        alert('Đã lưu bài viết vào danh mục!');
        onClose();
      })
      .catch((err) => console.error('Lỗi khi lưu:', err));
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="bg-white w-96 rounded-lg shadow-lg p-4"
          onClick={(e) => e.stopPropagation()}
        >
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
            {loading && (
              <p className="text-sm text-gray-500 px-2">Đang tải danh mục...</p>
            )}
            {error && <p className="text-sm text-red-600 px-2">{error}</p>}

            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelected(cat.id)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      cat.posts?.[0]?.images?.[0] ||
                      'https://via.placeholder.com/48'
                    }
                    alt={cat.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-500">Chỉ mình tôi</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="category"
                  className="accent-blue-600"
                  checked={selected === cat.id}
                  onChange={() => setSelected(cat.id)}
                />
              </div>
            ))}

            <hr className="my-2" />
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer w-full text-left"
            >
              <span className="text-xl leading-none">＋</span> Bộ sưu tập mới
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!selected}
              className={`px-4 py-2 rounded text-white ${
                !selected ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Xong
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white w-[520px] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">Tạo bộ sưu tập</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="block text-sm text-gray-600 mb-1">Tên</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Đặt tên cho bộ sưu tập của bạn..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-blue-600 rounded hover:bg-blue-50"
                disabled={creating}
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className={`px-4 py-2 rounded text-white ${
                  !newName.trim() || creating
                    ? 'bg-gray-300'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {creating ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SavePostModal;
