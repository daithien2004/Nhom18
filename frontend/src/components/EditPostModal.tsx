import React, { useState, useEffect } from 'react';
import { X, Image, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updatePost, clearUpdateError } from '../store/slices/postSlice';
import { toast } from 'react-toastify';
import instance from '../api/axiosInstant';

interface EditPostModalProps {
  postId: string;
  initialContent: string;
  initialImages: string[];
  onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  postId,
  initialContent,
  initialImages,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { isUpdating, updateError } = useAppSelector((state) => state.posts);

  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError);
      dispatch(clearUpdateError());
    }
  }, [updateError, dispatch]);

  // Upload ảnh
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
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
          toast.error(`Tải ảnh ${file.name} thất bại!`);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`Tải lên ${uploadedUrls.length} ảnh thành công!`);
      }
    } finally {
      setIsUploading(false);
      // Reset input để có thể upload lại cùng file
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc thêm hình ảnh');
      return;
    }

    try {
      await dispatch(updatePost({ postId, content, images })).unwrap();
      toast.success('Đã cập nhật bài viết');
      onClose();
    } catch (error) {
      // Error handled by updateError state
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Chỉnh sửa bài viết
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            disabled={isUpdating || isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating || isUploading}
          />

          {/* Preview Images */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`preview-${idx}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isUpdating || isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-4">
            <label
              className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                isUpdating || isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                  <span className="text-gray-700">Đang tải ảnh...</span>
                </>
              ) : (
                <>
                  <Image className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Thêm ảnh</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={isUpdating || isUploading}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            disabled={isUpdating || isUploading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isUpdating ||
              isUploading ||
              (!content.trim() && images.length === 0)
            }
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
