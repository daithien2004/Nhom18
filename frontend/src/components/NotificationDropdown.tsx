import React, { useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchNotifications } from '../store/slices/notificationSlice';
import NotificationItem from './NotificationItem';

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, total, loadingNotifications, error } = useAppSelector(
    (state) => state.notifications
  );
  const [page, setPage] = useState(1);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Lấy danh sách thông báo ban đầu
  useEffect(() => {
    dispatch(fetchNotifications({ page, limit: 10 }));
  }, [dispatch, page]);

  // Xử lý lỗi
  useEffect(() => {
    if (error) {
      console.error('Notification error:', error);
    }
  }, [error]);

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
          <Menu.Items className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-md focus:outline-none z-[9999]">
            <div className="py-2">
              <div className="px-4 py-2 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Thông báo
                </h2>
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

              {notifications.length < total && (
                <div className="px-4 py-3 text-center border-t border-gray-200">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="text-sm text-blue-600 hover:text-blue-700 transition"
                    disabled={loadingNotifications}
                  >
                    {loadingNotifications ? 'Đang tải...' : 'Tải thêm'}
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
