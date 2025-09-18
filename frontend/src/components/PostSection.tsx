import React, { useCallback, useEffect, useRef, useState } from "react";
import instance from "../api/axiosInstant";
import type { Post, Tab } from "../types/post";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PostMenu from "./PostMenu";
import SavePostModal from "./SavePostModal";
interface PostSectionProps {
  tab: Tab;
  newPost?: Post | null;
}

const LIMIT = 3;

const PostSection: React.FC<PostSectionProps> = ({ tab, newPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // fetch posts
  const fetchPosts = useCallback(
    async (pageNum: number, replace = false, signal?: AbortSignal) => {
      if (pageNum === 1) setInitialLoading(true);
      else setLoadingMore(true);

      try {
        const res = await instance.get(
          `/posts?type=${tab}&limit=${LIMIT}&page=${pageNum}`,
          { signal }
        );
        const newPosts = res.data as Post[];
        setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]));
        setHasMore(newPosts.length === LIMIT);
      } catch (err) {
        if ((err as any).name !== "CanceledError") {
          console.error("Lỗi khi load bài viết:", err);
        }
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [tab]
  );

  // reset + fetch khi đổi tab
  useEffect(() => {
    const controller = new AbortController();
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true, controller.signal);
    return () => controller.abort();
  }, [tab, fetchPosts]);

  // 👉 xử lý post mới
  useEffect(() => {
    if (!newPost) return;

    if (tab === "recent") {
      // prepend
      setPosts((prev) => [newPost, ...prev]);
    } else {
      // fetch lại cho chắc
      const controller = new AbortController();
      fetchPosts(1, true, controller.signal);
      return () => controller.abort();
    }
  }, [newPost, tab, fetchPosts]);

  // load thêm khi page thay đổi
  useEffect(() => {
    if (page > 1 && hasMore) {
      const controller = new AbortController();
      fetchPosts(page, false, controller.signal);
      return () => controller.abort();
    }
  }, [page, hasMore, fetchPosts]);

  // observer lazy load
  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!hasMore || !node) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  const toggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes.includes("me")
                ? p.likes.filter((id) => id !== "me")
                : [...p.likes, "me"],
            }
          : p
      )
    );
    try {
      const res = await instance.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: new Array(res.data.likeCount).fill("x") }
            : p
        )
      );
    } catch {
      fetchPosts(1, true);
    }
  };

  if (initialLoading) return <p>Đang tải bài viết...</p>;
  if (!initialLoading && posts.length === 0)
    return <p>Chưa có bài viết nào.</p>;

  return (
    <div className="space-y-6">
      {posts.map((post, idx) => (
        <div
          key={post._id}
          ref={idx === posts.length - 1 ? lastPostRef : null}
          className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4 mb-4 hover:shadow-md transition cursor-pointer"
          onClick={() => navigate(`/posts/${post._id}`)}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {post.author.username}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="ml-auto">
              <PostMenu
                onQuanTam={() => console.log("Quan tâm")}
                onKhongQuanTam={() => console.log("Không quan tâm")}
                onLuu={() => {
                  setSelectedPostId(post._id);
                  setShowSaveModal(true);
                }}
                onThongBao={() => console.log("Thông báo")}
                onNhung={() => console.log("Nhúng")}
              />
            </div>
          </div>

          {/* Content */}
          <p className="mt-3 text-gray-800 leading-relaxed">{post.content}</p>

          {/* Images */}
          {post.images.length > 0 &&
            (post.images.length === 1 ? (
              // Nếu chỉ có 1 ảnh → full width
              <img
                src={post.images[0]}
                alt="post"
                className="w-full h-64 object-cover rounded-lg mt-3"
              />
            ) : (
              // Nếu nhiều ảnh → cuộn ngang
              <div className="flex gap-2 mt-3 overflow-x-auto rounded-lg scrollbar-hide snap-x snap-mandatory">
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="post"
                    className="w-64 h-48 object-cover rounded-lg flex-shrink-0 snap-start"
                  />
                ))}
              </div>
            ))}

          {/* Action bar */}
          <div className="flex justify-around items-center mt-4 border-t border-gray-100 pt-2 text-gray-600 text-sm">
            <button
              onClick={(e) => toggleLike(e, post._id)}
              className="flex items-center gap-1 hover:text-red-500 transition"
            >
              <Heart size={18} />
              <span>{post.likes.length}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition">
              <MessageCircle size={18} />
              <span>{post.comments.length}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition">
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      ))}
      {loadingMore && (
        <p className="text-center text-gray-500">Đang tải thêm...</p>
      )}

      {showSaveModal && selectedPostId && (
        <SavePostModal
          postId={selectedPostId}
          onClose={() => {
            setShowSaveModal(false);
            setSelectedPostId(null);
          }}
        />
      )}
    </div>
  );
};

export default PostSection;
