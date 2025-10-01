import React, { useEffect, useRef, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  fetchNotifications,
  markAllAsRead,
} from '../store/slices/notificationSlice';
import NotificationItem from './NotificationItem';
import { toast } from 'react-toastify';

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, total, loadingNotifications, unreadCount, error } =
    useAppSelector((state) => state.notifications);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null); // Ref cho container để control scroll
  const isLoadingMoreRef = useRef(false); // Track loading more để tránh duplicate

  // Lấy danh sách thông báo ban đầu
  useEffect(() => {
    dispatch(fetchNotifications({ page, limit: 5 }));
  }, [dispatch, page]);

  // Xử lý lỗi
  useEffect(() => {
    if (error) {
      toast.error(`Đã có lỗi: ${error}`);
    }
  }, [error]);

  // Giữ scroll position khi load thêm
  useEffect(() => {
    if (
      !loadingNotifications &&
      isLoadingMoreRef.current &&
      containerRef.current
    ) {
      const container = containerRef.current;
      const scrollHeightBefore = container.scrollHeight; // Lưu height trước (nhưng vì append cuối, cần adjust sau)
      // Sau khi Redux update notifications, requestAnimationFrame để scroll adjust
      requestAnimationFrame(() => {
        const addedHeight = container.scrollHeight - scrollHeightBefore;
        container.scrollTop += addedHeight; // Giữ vị trí scroll cũ + height mới
      });
      isLoadingMoreRef.current = false;
    }
  }, [notifications, loadingNotifications]);

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  };

  const handleLoadMore = () => {
    if (loadingNotifications || notifications.length >= total) return;
    isLoadingMoreRef.current = true;
    setPage((prev) => prev + 1);
  };

  const hasMore = notifications.length < total;

  return (
    <div className="relative">
      <Menu as="div" className="relative">
        <Menu.Button className="relative p-2 text-gray-800 hover:text-gray-600 transition">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Menu.Button>
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-md focus:outline-none z-[9999] max-h-96 overflow-y-auto"
            ref={containerRef}
          >
            <div className="py-2 min-h-full">
              <div className="px-4 py-2 flex justify-between items-center border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold text-gray-800">
                  Thông báo
                </h2>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              {loadingNotifications && notifications.length === 0 ? (
                <div className="px-4 py-4 text-center text-gray-600">
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-4 text-center text-gray-600">
                  Không có thông báo
                </div>
              ) : (
                notifications.map((notif) => (
                  <Menu.Item key={notif.id}>
                    {() => <NotificationItem notif={notif} />}
                  </Menu.Item>
                ))
              )}

              {/* Loading more indicator */}
              {loadingNotifications && isLoadingMoreRef.current && (
                <div className="px-4 py-2 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-500" />
                </div>
              )}

              {/* Load more button */}
              {hasMore && !loadingNotifications && (
                <div className="px-4 py-3 text-center border-t border-gray-200">
                  <button
                    onClick={handleLoadMore}
                    className="text-sm text-blue-600 hover:text-blue-700 transition"
                  >
                    Tải thêm
                  </button>
                </div>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default NotificationDropdown;
