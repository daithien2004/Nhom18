import React, { useEffect, useState } from 'react';
import instance from '../api/axiosInstant';
import type { Post } from '../types/post';
import type { Tab } from '../types/post';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostSectionProps {
  tab: Tab;
}

const PostSection: React.FC<PostSectionProps> = ({ tab }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/posts?type=${tab}&limit=8`);
      setPosts(res.data);
    } catch (error) {
      console.error('Lỗi khi load bài viết:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes.includes('me')
                ? p.likes.filter((id) => id !== 'me')
                : [...p.likes, 'me'],
            }
          : p
      )
    );
    try {
      const res = await instance.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: new Array(res.data.likeCount).fill('x') }
            : p
        )
      );
    } catch (err) {
      // revert if error by refetching
      fetchPosts();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [tab]);

  if (loading) return <p>Đang tải bài viết...</p>;
  if (posts.length === 0) return <p>Chưa có bài viết nào.</p>;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4 mb-4 hover:shadow-md transition cursor-pointer"
          onClick={() => navigate(`/posts/${post._id}`)}
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
          </div>

          {/* Content */}
          <p className="mt-3 text-gray-800 leading-relaxed">{post.content}</p>

          {/* Images */}
          {post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3 rounded-lg overflow-hidden">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="post"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

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
    </div>
  );
};

export default PostSection;
