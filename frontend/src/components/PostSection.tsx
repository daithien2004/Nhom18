import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import PostMenu from './PostMenu';
import SavePostModal from './SavePostModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Post, Tab } from '../types/post';
import SharePostModal from './SharePostModal';
import {
  addNewPost,
  fetchPostsThunk,
  resetPosts,
  toggleLike,
} from '../store/slices/postSlice';

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

  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPostsThunk({ tab, page: 1, limit: LIMIT, replace: true }));
  }, [tab, dispatch]);

  useEffect(() => {
    if (!newPost) return;
    if (tab === 'recent') {
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

  const toggleLikeHandler = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    dispatch(toggleLike({ postId }));
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
          <div className="mt-3 text-gray-800 leading-relaxed">
            {post.caption && <p>{post.caption}</p>}
            {post.sharedFrom && (
              <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={post.sharedFrom.author.avatar || '/default-avatar.png'}
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
                  <div className="mt-2">
                    {(post.sharedFrom.images || []).length === 1 ? (
                      <div className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                        <img
                          src={post.sharedFrom.images[0]}
                          alt="shared post"
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (post.sharedFrom.images || []).length === 2 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {post.sharedFrom.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                          >
                            <img
                              src={img}
                              alt="shared post"
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (post.sharedFrom.images || []).length === 3 ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                          <img
                            src={post.sharedFrom.images[0]}
                            alt="shared post"
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="grid grid-rows-2 gap-2">
                          {post.sharedFrom.images.slice(1).map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                              <img
                                src={img}
                                alt="shared post"
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {post.sharedFrom.images.slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                          >
                            <img
                              src={img}
                              alt="shared post"
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {idx === 3 &&
                              post.sharedFrom!.images.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold">
                                  +{post.sharedFrom!.images.length - 4}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
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
            <div className="mt-3">
              {post.images.length === 1 ? (
                <div className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img
                    src={post.images[0]}
                    alt="post"
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : post.images.length === 2 ? (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <img
                        src={img}
                        alt="post"
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              ) : post.images.length === 3 ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <img
                      src={post.images[0]}
                      alt="post"
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="grid grid-rows-2 gap-2">
                    {post.images.slice(1).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <img
                          src={img}
                          alt="post"
                          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <img
                        src={img}
                        alt="post"
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {idx === 3 && post.images.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold">
                          +{post.images.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Action bar */}
          <div className="flex justify-around items-center mt-4 border-t border-gray-200 pt-3 text-gray-600">
            <button
              onClick={(e) => toggleLikeHandler(e, post.id)}
              className="flex-1 flex justify-center items-center gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Heart
                size={20}
                className={`${
                  post.isLikedByCurrentUser
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-600'
                } transition-colors duration-200`}
              />
              <span className="text-sm font-medium">
                {(post.likes || []).length} Thích
              </span>
            </button>
            <button
              onClick={() => navigate(`/posts/${post.id}`)}
              className="flex-1 flex justify-center items-center gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <MessageCircle size={20} className="text-gray-600" />
              <span className="text-sm font-medium">
                {(post.comments || []).length} Bình luận
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSharePostId(post.id);
                setShowShareModal(true);
                setShareUser({
                  username: post.author.username,
                  avatar: post.author.avatar || '/default-avatar.png',
                });
              }}
              className="flex-1 flex justify-center items-center gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Share2 size={20} className="text-gray-600" />
              <span className="text-sm font-medium">Chia sẻ</span>
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
