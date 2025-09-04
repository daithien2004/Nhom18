import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPostDetail, clearPostDetail } from "../store/slices/postSlice";

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { postDetail, isLoading, isError } = useAppSelector(
    (state) => state.post
  );

  useEffect(() => {
    if (postId) dispatch(fetchPostDetail(postId));
    return () => {
      dispatch(clearPostDetail());
    };
  }, [dispatch, postId]);

  if (isLoading) return <p>Đang tải bài viết...</p>;
  if (isError) return <p>Lỗi khi tải bài viết.</p>;
  if (!postDetail) return <p>Không tìm thấy bài viết.</p>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex z-50">
      {/* Nút đóng */}
      <button
        onClick={() => navigate("/")}
        className="cursor-pointer absolute top-4 right-4 
             w-10 h-10 flex items-center justify-center
             rounded-full bg-white bg-opacity-80 shadow-lg
             text-gray-800 text-3xl font-bold
             hover:bg-gray-300
             transition duration-200 "
      >
        ✕
      </button>

      {/* LEFT: Image */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {postDetail.images.length > 0 && (
          <img
            src={postDetail.images[0]}
            alt="post"
            className="max-h-screen max-w-full object-contain"
          />
        )}
      </div>

      {/* RIGHT: Content */}
      <div className="px-4 w-[500px] bg-white flex flex-col justify-between max-h-screen">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <img
            src={postDetail.author.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="font-semibold">{postDetail.author.username}</p>
            <p className="text-xs text-gray-500">
              {new Date(postDetail.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-gray-800">{postDetail.content}</p>
        </div>

        {/* Stats */}
        <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 flex justify-between">
          <span>👍 {postDetail.likeCount}</span>
          <span>
            {postDetail.commentCount} bình luận • {postDetail.shareCount} chia
            sẻ
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-around text-gray-600 text-sm py-2 border-b border-gray-200">
          <button className="flex items-center space-x-1 hover:bg-gray-100 px-4 py-1 rounded">
            <span>👍</span> <span>Thích</span>
          </button>
          <button className="flex items-center space-x-1 hover:bg-gray-100 px-4 py-1 rounded">
            <span>💬</span> <span>Bình luận</span>
          </button>
          <button className="flex items-center space-x-1 hover:bg-gray-100 px-4 py-1 rounded">
            <span>🔄</span> <span>Chia sẻ</span>
          </button>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {postDetail.comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
          ) : (
            postDetail.comments.map((comment: any) => (
              <div key={comment._id} className="flex space-x-3">
                <img
                  src={comment.author.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <p className="text-sm font-semibold">
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
        <div className="px-4 py-3 border-t border-gray-200 flex items-center space-x-3">
          <img
            src={"/default-avatar.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="flex-1 bg-gray-100 px-3 py-2 rounded-full text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
