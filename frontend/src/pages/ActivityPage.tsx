import React, { useEffect } from 'react';
import { Loader2, Share2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchActivities } from '../store/slices/activitySlice';
import type { Activity } from '../store/slices/activitySlice';

const ActivityPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activities, isLoading, page, hasMore, error } = useAppSelector(
    (state) => state.activities // <-- dùng 'activities' (phù hợp với store key)
  );

  useEffect(() => {
    dispatch(fetchActivities({ page: 1, limit: 10 }))
      .unwrap()
      .catch(() => toast.error('Không thể tải hoạt động!'));
  }, [dispatch]);

  const likes = activities.filter((a) => a.type === 'like');
  const comments = activities.filter((a) => a.type === 'comment');

  return (
    <div className="flex bg-white">
      <aside className="w-64 bg-white fixed h-screen shadow-md p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Nhật ký hoạt động</h2>
        <p className="text-sm text-gray-500 mb-6">Thích và bình luận</p>

        <div className="space-y-3 flex-1">
          <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 text-blue-600 font-medium">
            Lượt thích của bạn
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            Bình luận của bạn (sắp có)
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-10">
          <section>
            <h3 className="text-lg font-bold mb-4">Lượt thích gần đây</h3>

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải...
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-4">
              {likes.map((like: Activity) => (
                <div
                  key={like.id}
                  className="bg-white rounded-xl shadow p-4 flex gap-4 items-start"
                >
                  <img
                    src={
                      like.post?.images?.[0] ??
                      'https://via.placeholder.com/100'
                    }
                    alt="post"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Bạn đã thích bài viết của{' '}
                      <span className="font-semibold">
                        {like.postOwner?.username ?? 'Người dùng'}
                      </span>
                    </p>
                    <p className="font-medium text-gray-800">
                      {like.post?.content ?? ''}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {like.createdAt
                        ? new Date(like.createdAt).toLocaleString()
                        : ''}
                    </p>
                    <div className="flex gap-4 mt-2 text-gray-500">
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <Eye size={16} /> Xem
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <Share2 size={16} /> Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4">Bình luận gần đây</h3>
            <div className="space-y-4">
              {comments.map((c: Activity) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl shadow p-4 flex gap-4 items-start"
                >
                  <img
                    src={
                      c.post?.images?.[0] ?? 'https://via.placeholder.com/100'
                    }
                    alt="post"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Bạn đã bình luận về bài viết của{' '}
                      <span className="font-semibold">
                        {c.postOwner?.username ?? 'Người dùng'}
                      </span>
                    </p>
                    <p className="font-medium text-gray-800">
                      {c.comment?.content ?? '(không có nội dung)'}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : ''}
                    </p>
                    <div className="flex gap-4 mt-2 text-gray-500">
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <Eye size={16} /> Xem
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <Share2 size={16} /> Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
