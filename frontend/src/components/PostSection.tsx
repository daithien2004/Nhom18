import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchPostsThunk,
  toggleLike,
  resetPosts,
  addNewPost,
} from '../store/slices/postSlice';
import type { Post, Tab } from '../types/post';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import PostMenu from './PostMenu';
import SavePostModal from './SavePostModal';

interface PostSectionProps {
  tab: Tab;
  newPost?: Post | null;
}

const LIMIT = 3;

const PostSection: React.FC<PostSectionProps> = ({ tab, newPost }) => {
  const dispatch = useAppDispatch();
  const { posts, page, hasMore, initialLoading, loadingMore, error } =
    useAppSelector((state) => state.posts);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Reset và fetch bài viết khi thay đổi tab
  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPostsThunk({ tab, page: 1, limit: LIMIT, replace: true }));
  }, [tab, dispatch]);

  // Xử lý bài viết mới
  useEffect(() => {
    if (!newPost) return;
    if (tab === 'recent') {
      dispatch(addNewPost(newPost));
    } else {
      dispatch(fetchPostsThunk({ tab, page: 1, limit: LIMIT, replace: true }));
    }
  }, [newPost, tab, dispatch]);

  // Lazy-load với IntersectionObserver
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
  const toggleLikeHandler = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    dispatch(toggleLike({ postId, isPostList: true }));
  };

  if (initialLoading) return <p>Đang tải bài viết...</p>;
  if (!initialLoading && posts.length === 0)
    return <p>Chưa có bài viết nào.</p>;

  return (
    <div className="space-y-6">
      {posts.map((post, idx) => (
        <div
          key={post.id}
          ref={idx === posts.length - 1 ? lastPostRef : null}
          className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4 mb-4 hover:shadow-md transition cursor-pointer"
          onClick={() => navigate(`/posts/${post.id}`)}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar || '/default-avatar.png'}
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
                onInterested={() => console.log('Quan tâm')}
                onNotInterested={() => console.log('Không quan tâm')}
                onSave={() => {
                  setSelectedPostId(post.id);
                  setShowSaveModal(true);
                }}
                onNotify={() => console.log('Thông báo')}
                onEmbed={() => console.log('Nhúng')}
              />
            </div>
          </div>
          {/* Content */}
          <p className="mt-3 text-gray-800 leading-relaxed">{post.content}</p>
          {/* Images */}
          {post.images.length > 0 &&
            (post.images.length === 1 ? (
              <img
                src={post.images[0]}
                alt="post"
                className="w-full h-64 object-cover rounded-lg mt-3"
              />
            ) : (
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
              onClick={(e) => toggleLikeHandler(e, post.id)}
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
    </div>
  );
};

export default PostSection;
