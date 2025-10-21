import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPostDetail,
  clearPostDetail,
  toggleLike,
  addComment,
  clearCommentError,
} from "../store/slices/postSlice";
import { toast } from "react-toastify";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import SharePostModal from "../components/SharePostModal";

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
    likes,
  } = useAppSelector((state) => state.posts);

  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

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
    await dispatch(
      addComment({ postId, content: commentText.trim() })
    ).unwrap();
    setCommentText("");
  };

  const sharedFrom = postDetail?.sharedFrom ?? null;

  const postImages = Array.isArray(postDetail?.images)
    ? postDetail!.images
    : [];
  const sharedImages =
    sharedFrom && Array.isArray(sharedFrom.images) ? sharedFrom.images : [];
  const displayImages = postImages.length > 0 ? postImages : sharedImages;
  const hasImages = displayImages.length > 0;

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [postId]);

  const goPrev = () =>
    hasImages &&
    setCurrentImageIndex(
      (idx) => (idx - 1 + displayImages.length) % displayImages.length
    );

  const goNext = () =>
    hasImages &&
    setCurrentImageIndex((idx) => (idx + 1) % displayImages.length);

  if (isLoadingDetail) return <p>Đang tải bài viết...</p>;
  if (isErrorDetail) return <p>Lỗi khi tải bài viết.</p>;
  if (!postDetail) return <p>Không tìm thấy bài viết.</p>;

  return (
    <div className="fixed inset-0 bg-black/90 flex z-50">
      {/* Nút đóng (nổi bật) */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 z-[9999] w-10 h-10 flex items-center justify-center 
             rounded-full bg-black/70 text-white shadow-[0_0_10px_rgba(0,0,0,0.8)] hover:bg-black/90 transition"
        title="Đóng"
      >
        <X size={22} />
      </button>

      {/* LEFT: Hình ảnh */}
      <div className="flex-1 flex items-center justify-center bg-black relative select-none">
        {hasImages && (
          <>
            <img
              src={displayImages[currentImageIndex]}
              alt="post"
              className="max-h-screen max-w-full object-contain transition-all duration-300"
            />

            {/* Mũi tên chuyển ảnh */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white shadow-lg transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white shadow-lg transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Chấm tròn chỉ số ảnh */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {displayImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        i === currentImageIndex ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Nội dung bài viết */}
      <div className="w-[480px] bg-white flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
            <img
              src={postDetail.author?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900">
                {postDetail.author?.username || "Ẩn danh"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(postDetail.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Nội dung */}
          <div className="px-4 py-3 border-b border-gray-200">
            {postDetail.caption && (
              <p className="text-gray-800 italic mb-2">{postDetail.caption}</p>
            )}
            {postDetail.content && (
              <p className="text-gray-800 leading-relaxed">
                {postDetail.content}
              </p>
            )}
          </div>

          {/* Bài chia sẻ */}
          {sharedFrom && (
            <div className="px-4 py-3 border border-gray-200 bg-gray-50 mx-4 my-3 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={sharedFrom.author?.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {sharedFrom.author?.username || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sharedFrom.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-800">{sharedFrom.content}</p>
              {Array.isArray(sharedFrom.images) &&
                sharedFrom.images.length > 0 && (
                  <img
                    src={sharedFrom.images[0]}
                    alt="shared"
                    className="mt-2 rounded-lg max-h-60 object-cover"
                  />
                )}
            </div>
          )}

          {/* Bình luận */}
          <div className="px-4 py-3 space-y-3">
            {postDetail.comments.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
            ) : (
              postDetail.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <img
                    src={c.author?.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                    <p className="text-sm font-semibold">
                      {c.author?.username}
                    </p>
                    <p className="text-sm text-gray-800">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thanh thao tác */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0">
          <div className="flex justify-around text-gray-600 text-sm py-2 border-b border-gray-100">
            <button
              onClick={() => postId && dispatch(toggleLike({ postId }))}
              className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Heart
                size={18}
                className={
                  likes[postDetail.id]?.isLiked
                    ? "fill-red-500 text-red-500"
                    : ""
                }
              />
              <span>
                {likes[postDetail.id]?.isLiked ? "Bỏ thích" : "Thích"}
              </span>
            </button>
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              <MessageCircle size={18} />
              <span>Bình luận</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Nhập bình luận */}
          <div className="flex items-center gap-3 px-4 py-2">
            <img
              src={postDetail.author.avatar || "/default-avatar.png"}
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
                  if (
                    e.key === "Enter" &&
                    !isCommenting &&
                    commentText.trim()
                  ) {
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

        {showShareModal && postId && (
          <SharePostModal
            postId={postId}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
