import React, { useState } from "react";
import PostSection from "../components/PostSection";
import instance from "../api/axiosInstant";
import type { Tab } from "../types/auth";

const HomePage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("recent");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Upload ảnh
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await instance.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      } catch (err) {
        console.error("Lỗi khi upload ảnh:", err);
      }
    }
    setImages((prev) => [...prev, ...uploadedUrls]);
  };

  // Tạo post
  const handleCreatePost = async () => {
    if (!content && images.length === 0) return;
    try {
      setUploading(true);
      await instance.post("/posts", { content, images });
      setContent("");
      setImages([]);
      // Reload tab hiện tại
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Form tạo post */}
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <div className="flex space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/8792/8792047.png"
            alt="avatar"
            className="w-12 h-12 rounded-full"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì thế?"
            className="w-full border-none resize-none focus:ring-0 rounded-lg p-2 bg-gray-100"
            rows={3}
          />
        </div>

        {/* Upload ảnh */}
        <div className="mt-2 flex flex-col space-y-2">
          <label className="cursor-pointer text-blue-600 hover:text-blue-800">
            Thêm ảnh
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
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

        <div className="mt-2 text-right">
          <button
            onClick={handleCreatePost}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {(["recent", "hot", "popular", "pinned"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded-full ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "recent"
              ? "Mới nhất"
              : t === "hot"
              ? "Hot"
              : t === "popular"
              ? "Xem nhiều"
              : "Đáng chú ý"}
          </button>
        ))}
      </div>

      {/* Section posts */}
      <PostSection tab={tab} />
    </div>
  );
};
export default HomePage;
