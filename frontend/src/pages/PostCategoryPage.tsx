import React, { useEffect, useState } from "react";
import { Ellipsis, Share2, FolderPlus } from "lucide-react";
import instance from "../api/axiosInstant";
import type { Post } from "../types/post";
import PostMenu from "../components/PostMenu";

interface Collection {
  id: string;
  name: string;
  privacy: string; // ví dụ: "Chỉ mình tôi"
}

const SavedPosts: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  // giả sử API /saved/posts trả về danh sách bài viết đã lưu
  useEffect(() => {
    async function fetchData() {
      try {
        const postsRes = await instance.get("/saved/posts");
        setSavedPosts(postsRes.data);

        const colRes = await instance.get("/saved/collections");
        setCollections(colRes.data);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold mb-4">Đã lưu</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
              📂
            </div>
            <span className="font-medium">Mục đã lưu</span>
          </div>
        </div>
        <h3 className="mt-6 text-sm font-semibold text-gray-500">
          Bộ sưu tập của tôi
        </h3>
        <div className="mt-2 space-y-2">
          {collections.map((col) => (
            <div
              key={col.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <img
                src="/default-collection.png"
                alt={col.name}
                className="w-10 h-10 rounded object-cover"
              />
              <div>
                <p className="font-medium">{col.name}</p>
                <p className="text-xs text-gray-500">{col.privacy}</p>
              </div>
            </div>
          ))}
          <button className="flex items-center gap-2 text-blue-600 mt-2">
            <span className="text-lg">＋</span> Tạo bộ sưu tập mới
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <h2 className="text-lg font-bold mb-4">Tất cả</h2>
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{post.author.username}</p>
                  <p className="text-xs text-gray-500">Đã lưu từ bài viết</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
                    <FolderPlus size={16} /> Thêm vào bộ sưu tập
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share2 size={18} />
                  </button>
                  <PostMenu />
                </div>
              </div>

              {/* Content */}
              <p className="mt-3 text-gray-800">{post.content}</p>
              {post.images?.length > 0 && (
                <img
                  src={post.images[0]}
                  alt="saved"
                  className="w-full h-60 object-cover rounded-lg mt-3"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedPosts;
