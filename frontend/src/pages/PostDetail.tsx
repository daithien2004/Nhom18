import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchPostDetail,
  clearPostDetail,
  toggleLike,
  addComment,
  clearCommentError,
} from '../store/slices/postSlice';
import { toast } from 'react-toastify'; // Giả định dùng toast
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    postDetail,
    isLoadingDetail,
    isErrorDetail,
    isCommenting,
    commentError,
  } = useAppSelector((state) => state.posts);
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goPrev = () => {
    if (!postDetail || postDetail.images.length === 0) return;
    setCurrentImageIndex(
      (idx) => (idx - 1 + postDetail.images.length) % postDetail.images.length
    );
  };

  const goNext = () => {
    if (!postDetail || postDetail.images.length === 0) return;
    setCurrentImageIndex((idx) => (idx + 1) % postDetail.images.length);
  };

  useEffect(() => {
    if (postId) dispatch(fetchPostDetail(postId));
    return () => {
      dispatch(clearPostDetail());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (commentError) {
      toast.error(commentError);
      dispatch(clearCommentError());
    }
  }, [commentError, dispatch]);

  const handleAddComment = async () => {
    if (!postId || !commentText.trim()) return;
    try {
      await dispatch(
        addComment({ postId, content: commentText.trim() })
      ).unwrap();
      setCommentText('');
    } catch (err) {
      // Lỗi đã được xử lý trong thunk
    }
  };

  if (isLoadingDetail) return <p>Đang tải bài viết...</p>;
  if (isErrorDetail) return <p>Lỗi khi tải bài viết.</p>;
  if (!postDetail) return <p>Không tìm thấy bài viết.</p>;

  return (
    <div className="fixed inset-0 bg-black/90 flex z-50">
      {/* Nút đóng */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center
               rounded-full bg-white/90 text-gray-700 shadow-lg hover:bg-gray-200 transition"
      >
        <X size={22} />
      </button>

      {/* LEFT: Image swiper */}
      <div className="flex-1 flex items-center justify-center bg-black relative select-none">
        {postDetail.images.length > 0 && (
          <>
            <img
              src={postDetail.images[currentImageIndex]}
              alt="post"
              className="max-h-screen max-w-full object-contain"
            />

            {postDetail.images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 
             w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 
             flex items-center justify-center text-white shadow-lg 
             transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 
             w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 
             flex items-center justify-center text-white shadow-lg 
             transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {postDetail.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        i === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Content */}
      <div className="w-[480px] bg-white flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <img
            src={postDetail.author.avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-900">
              {postDetail.author.username}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(postDetail.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-gray-800 leading-relaxed">{postDetail.content}</p>
        </div>

        {/* Stats */}
        <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 flex justify-between">
          <span>{postDetail.likeCount} lượt thích</span>
          <span>
            {postDetail.commentCount} bình luận • {postDetail.shareCount} chia
            sẻ
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-around text-gray-600 text-sm py-2 border-b border-gray-200">
          <button
            onClick={() =>
              postId && dispatch(toggleLike({ postId, isPostList: false }))
            }
            className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            disabled={isCommenting}
          >
            <Heart
              size={18}
              className={
                postDetail.isLikedByCurrentUser
                  ? 'fill-red-500 text-red-500'
                  : ''
              }
            />
            <span>
              {postDetail.isLikedByCurrentUser ? 'Bỏ thích' : 'Thích'}
            </span>
          </button>
          <button className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
            <MessageCircle size={18} />
            <span>Bình luận</span>
          </button>
          <button className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
            <Share2 size={18} />
            <span>Chia sẻ</span>
          </button>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {postDetail.comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
          ) : (
            postDetail.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.author.avatar || '/default-avatar.png'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="bg-gray-100 px-3 py-2 rounded-xl max-w-[80%]">
                  <p className="text-sm font-semibold text-gray-800">
                    {comment.author.username}
                  </p>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-3">
          <img
            src={'/default-avatar.png'}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Viết bình luận..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCommenting && commentText.trim()) {
                  handleAddComment();
                }
              }}
              disabled={isCommenting}
              className="w-full bg-gray-100 px-3 py-2 rounded-full text-sm outline-none disabled:opacity-50"
            />
            {isCommenting && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
