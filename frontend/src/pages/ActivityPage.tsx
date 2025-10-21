import React, { useEffect, useState } from "react";
import { Loader2, Share2, Eye, MessageCircle, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchActivities } from "../store/slices/activitySlice";
import type { Activity } from "../store/slices/activitySlice";
import { useNavigate } from "react-router-dom";
import SharePostModal from "../components/SharePostModal";

interface User {
  username: string | undefined;
  avatar: string;
}

const ActivityPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activities, isLoading, error } = useAppSelector(
    (state) => state.activities
  );

  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [shareUser, setShareUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<"like" | "comment">("like");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchActivities({ page: 1, limit: 10 }))
      .unwrap()
      .catch(() => toast.error("Không thể tải hoạt động!"));
  }, [dispatch]);

  const likes = activities.filter((a) => a.type === "like");
  const comments = activities.filter((a) => a.type === "comment");

  const renderActivityCard = (item: Activity, type: "like" | "comment") => (
    <div
      key={item.id}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 border hover:shadow-md transition-all duration-300"
    >
      {/* Ảnh bài viết */}
      <img
        src={
          item.post?.images?.[0] ||
          item.post?.sharedFrom?.images?.[0] ||
          "https://via.placeholder.com/200x150"
        }
        alt={item.post?.content?.slice(0, 20) || "activity"}
        className="w-32 h-32 object-cover rounded-lg"
      />

      {/* Nội dung */}
      <div className="flex-1 space-y-2">
        <p className="text-sm text-gray-600">
          {type === "like"
            ? "Bạn đã thích bài viết của "
            : "Bạn đã bình luận về bài viết của "}
          <span className="font-semibold text-gray-800">
            {item.postOwner?.username || "Người dùng"}
          </span>
        </p>

        <p className="font-semibold text-gray-800 line-clamp-2">
          {item.post?.content || item.post?.caption || "(Không có nội dung)"}
        </p>

        <p className="text-sm text-gray-500">
          Tác giả: {item.post?.author?.username || "Ẩn danh"}
        </p>

        <p className="text-xs text-gray-400">
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
        </p>

        {/* Nếu là bài chia sẻ */}
        {item.post?.sharedFrom && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">
              🔁 Chia sẻ từ {item.post.sharedFrom.author?.username || "Ẩn danh"}
            </p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {item.post.sharedFrom.content ||
                item.post.sharedFrom.caption ||
                "Không có nội dung"}
            </p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300"
            onClick={() => navigate(`/posts/${item.post?.id}`)}
          >
            <Eye size={16} className="inline mr-1" />
            Xem bài viết
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
            title="Chia sẻ"
            onClick={(e) => {
              e.stopPropagation();
              setSharePostId(item.id);
              setShowShareModal(true);
              setShareUser({
                username: item.post?.author?.username,
                avatar: item.post?.author?.avatar || "/default-avatar.png",
              });
            }}
          >
            <Share2 size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivities = (data: Activity[], type: "like" | "comment") => (
    <div className="space-y-6">
      {data.map((item) => renderActivityCard(item, type))}
    </div>
  );

  return (
    <div className="flex bg-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white fixed h-screen shadow-md p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Nhật ký hoạt động</h2>
        <p className="text-sm text-gray-500 mb-6">Theo dõi hoạt động của bạn</p>

        <div className="space-y-3 flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("like")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "like"
                ? "bg-gray-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart
              size={18}
              className={`${
                activeTab === "like" ? "text-blue-600" : "text-gray-500"
              }`}
            />
            Lượt thích của bạn
          </button>

          <button
            onClick={() => setActiveTab("comment")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "comment"
                ? "bg-gray-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageCircle
              size={18}
              className={`${
                activeTab === "comment" ? "text-blue-600" : "text-gray-500"
              }`}
            />
            Bình luận của bạn
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === "like"
                ? "Lượt thích gần đây"
                : "Bình luận gần đây"}
            </h2>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin w-4 h-4" />
              Đang tải hoạt động...
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!isLoading &&
            !error &&
            (activeTab === "like"
              ? renderActivities(likes, "like")
              : renderActivities(comments, "comment"))}

          {!isLoading &&
            !error &&
            ((activeTab === "like" && likes.length === 0) ||
              (activeTab === "comment" && comments.length === 0)) && (
              <p className="text-sm text-gray-500">Không có hoạt động nào.</p>
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
    </div>
  );
};

export default ActivityPage;
