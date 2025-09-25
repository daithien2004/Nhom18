import React, { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ActivityItem } from "../store/slices/activitySlice";
import type { RootState } from "../store/store";

const ActionStorePage: React.FC = () => {
  const likedMap = useAppSelector((s: RootState) => s.activity.liked);
  const comments = useAppSelector((s: RootState) => s.activity.comments);

  type CommentActivity = {
    id: string;
    postId: string;
    content: string;
    postPreview: string;
    image?: string;
    authorName?: string;
    commentedAt: string;
  };

  const items = useMemo<ActivityItem[]>(
    () =>
      Object.values(likedMap as Record<string, ActivityItem>).sort((a, b) =>
        a.likedAt < b.likedAt ? 1 : -1
      ),
    [likedMap]
  );
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white p-4">
        <h2 className="text-lg font-bold mb-2">Nhật ký hoạt động</h2>
        <p className="text-sm text-gray-500 mb-3">Thích và bình luận</p>
        <div className="space-y-1 text-sm">
          <div className="px-3 py-2 rounded bg-blue-50 text-blue-700">
            Lượt thích của bạn
          </div>
          <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-not-allowed text-gray-400">
            Bình luận của bạn (sắp có)
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">Lượt thích gần đây</h2>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có hoạt động nào.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it: ActivityItem) => (
              <div
                key={it.id}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                <img
                  src={it.image || "https://via.placeholder.com/120x90"}
                  alt={it.contentPreview}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Bạn đã thích bài viết của{" "}
                    <span className="font-medium">
                      {it.authorName || "Ẩn danh"}
                    </span>
                  </p>
                  <p className="text-gray-800 line-clamp-2 mt-1">
                    {it.contentPreview}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(it.likedAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/posts/${it.id}`)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Xem
                    </button>
                    <button className="p-2 rounded hover:bg-gray-100">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold mt-8 mb-2">Bình luận gần đây</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c: CommentActivity) => (
              <div
                key={c.id}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                <img
                  src={c.image || "https://via.placeholder.com/120x90"}
                  alt={c.postPreview}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Bạn đã bình luận về bài viết của{" "}
                    <span className="font-medium">
                      {c.authorName || "Ẩn danh"}
                    </span>
                  </p>
                  <p className="text-gray-800 line-clamp-2 mt-1">
                    {c.postPreview}
                  </p>
                  <p className="text-xs text-gray-500">Nội dung: {c.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(c.commentedAt).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/posts/${c.postId}`)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Xem
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActionStorePage;
