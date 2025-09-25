import React, { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PostMenu from "./PostMenu";
import SavePostModal from "./SavePostModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Post, Tab } from "../types/post";
import SharePostModal from "./SharePostModal";
import { likeAdded, likeRemoved } from "../store/slices/activitySlice";
import {
  addNewPost,
  fetchPostsThunk,
  resetPosts,
  toggleLike,
} from "../store/slices/postSlice";

interface PostSectionProps {
  tab: Tab;
  newPost?: Post | null;
}

const LIMIT = 3;

interface User {
  username: string;
  avatar: string;
}

const PostSection: React.FC<PostSectionProps> = ({ tab, newPost }) => {
  const dispatch = useAppDispatch();
  const { posts, page, hasMore, initialLoading, loadingMore, error } =
    useAppSelector((state) => state.posts);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);

  const [shareUser, setShareUser] = useState<User | null>(null);

  // Reset và fetch bài viết khi thay đổi tab
  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPostsThunk({ tab, page: 1, limit: LIMIT, replace: true }));
  }, [tab, dispatch]);

  // Xử lý bài viết mới
  useEffect(() => {
    if (!newPost) return;
    if (tab === "recent") {
      dispatch(addNewPost(newPost));
    } else {
      dispatch(fetchPostsThunk({ tab, page: 1, limit: LIMIT, replace: true }));
    }
  }, [newPost, tab, dispatch]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!hasMore || !node || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          dispatch(
            fetchPostsThunk({
              tab,
              page: page + 1,
              limit: LIMIT,
              replace: false,
            })
          );
        }
      });
      observer.current.observe(node);
    },
    [loadingMore, hasMore, tab, page, dispatch]
  );

  // Xử lý thích bài viết
  const toggleLikeHandler = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const target = posts.find((p: Post) => p.id === postId);
    try {
      const action = await dispatch(toggleLike({ postId, isPostList: true }));
      const payload: any = (action as any).payload;
      if (target && payload && typeof payload.isLiked === "boolean") {
        if (payload.isLiked) {
          dispatch(
            likeAdded({
              post: {
                id: target.id,
                content: target.content,
                caption: target.caption,
                images: target.images || [],
                author: {
                  username: target.author.username,
                  avatar: target.author.avatar,
                },
                likes: target.likes as any,
                comments: target.comments as any,
                shares: target.shares as any,
                views: target.views,
                createdAt: target.createdAt,
              } as any,
            })
          );
        } else {
          dispatch(likeRemoved({ postId }));
        }
      }
    } catch {
      // no-op
    }
  };

  if (initialLoading) return <p>Đang tải bài viết...</p>;
  if (!initialLoading && posts.length === 0)
    return <p>Chưa có bài viết nào.</p>;

  return (
    <div className="space-y-6">
      {posts.map((post: Post, idx: number) => (
        <div
          key={post.id}
          ref={idx === posts.length - 1 ? lastPostRef : null}
          className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4 mb-4 hover:shadow-md transition cursor-pointer"
          onClick={() => navigate(`/posts/${post.id}`)}
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
                onInterested={() => console.log("Quan tâm")}
                onNotInterested={() => console.log("Không quan tâm")}
                onSave={() => {
                  setSelectedPostId(post.id);
                  setShowSaveModal(true);
                }}
                onNotify={() => console.log("Thông báo")}
                onEmbed={() => console.log("Nhúng")}
              />
            </div>
          </div>
          {/* Content */}
          <div className="mt-3 text-gray-800 leading-relaxed">
            {post.caption && <p>{post.caption}</p>}
            {post.sharedFrom && (
              <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={post.sharedFrom.author.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <p className="text-sm font-semibold text-gray-900">
                    {post.sharedFrom.author.username}
                  </p>
                </div>
                {post.sharedFrom.content && (
                  <p className="text-sm text-gray-700">
                    {post.sharedFrom.content}
                  </p>
                )}
                {(post.sharedFrom.images || []).length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto rounded-lg scrollbar-hide snap-x snap-mandatory">
                    {post.sharedFrom.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt="shared post"
                        className="w-48 h-32 object-cover rounded-lg flex-shrink-0 snap-start"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {!post.sharedFrom && post.content && (
              <p className="text-gray-800">{post.content}</p>
            )}
          </div>

          {/* Images */}
          {!post.sharedFrom && post.images && post.images.length > 0 && (
            <>
              {post.images.length === 1 ? (
                <img
                  src={post.images[0]}
                  alt="post"
                  className="w-full h-64 object-cover rounded-lg mt-3"
                />
              ) : (
                <div className="flex gap-2 mt-3 overflow-x-auto rounded-lg scrollbar-hide snap-x snap-mandatory">
                  {post.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt="post"
                      className="w-64 h-48 object-cover rounded-lg flex-shrink-0 snap-start"
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {/* Action bar */}
          <div className="flex justify-around items-center mt-4 border-t border-gray-100 pt-2 text-gray-600 text-sm">
            <button
              onClick={(e) => toggleLikeHandler(e, post.id)}
              className="flex items-center gap-1 hover:text-red-500 transition"
            >
              <Heart size={18} />
              <span>{(post.likes || []).length}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition cursor-pointer">
              <MessageCircle size={18} />
              <span>{(post.comments || []).length}</span>
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
              className="flex items-center gap-1 hover:text-green-500 transition cursor-pointer"
            >
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      ))}
      {loadingMore && (
        <p className="text-center text-gray-500">Đang tải thêm...</p>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {showSaveModal && selectedPostId && (
        <SavePostModal
          postId={selectedPostId}
          onClose={() => {
            setShowSaveModal(false);
            setSelectedPostId(null);
          }}
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
  );
};

export default PostSection;
