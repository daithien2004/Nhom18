import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import {
  UserCircle,
  MessageCircle,
  Contact,
  Home,
  Bookmark,
  BarChart3,
  History,
} from 'lucide-react';
import { persistor } from '../store/store';

const MainLayout: React.FC = () => {
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { conversations } = useAppSelector((state) => state.conversations);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Check if there are any unread messages
  const hasUnreadMessages = useMemo(() => {
    if (!user || !conversations || conversations.length === 0) return false;

    return conversations.some((conv) => {
      if (!conv.lastMessage) return false;

      const isRead = conv.lastMessage.readBy?.includes(user.id);
      const isOwnMessage = conv.lastMessage.sender.id === user.id;

      return !isOwnMessage && !isRead;
    });
  }, [conversations, user]);

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropDownOpen(!isDropdownOpen);
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="bg-white w-20 flex flex-col items-center py-6 justify-between fixed h-screen shadow-md z-20">
        <div className="flex flex-col items-center gap-6">
          {/* Avatar + Dropdown */}
          <div className="relative">
            <div
              onClick={toggleDropdown}
              className="w-12 h-12 rounded-full border-4 border-white shadow overflow-hidden"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-4xl bg-gray-100 text-gray-600">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Dropdown menu hiển thị bên phải avatar */}
            {isDropdownOpen && (
              <div className="fixed mt-2 ml-2 w-48 bg-white shadow-md border border-gray-200 rounded-lg z-50">
                <ul>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                    onClick={() => {
                      navigate('/profile');
                      setIsDropDownOpen(false);
                    }}
                  >
                    Trang cá nhân
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                    onClick={() => {
                      navigate('/setting');
                      setIsDropDownOpen(false);
                    }}
                  >
                    Cài đặt
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                    onClick={() => {
                      handleLogout();
                      setIsDropDownOpen(false);
                    }}
                  >
                    Đăng xuất
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <Home
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/home') ? 'text-blue-600' : 'text-gray-800'
              }`}
              onClick={() => {
                navigate('/');
                setIsDropDownOpen(false);
              }}
            />

            {/* Message icon with unread badge */}
            <div className="relative">
              <MessageCircle
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive('/conversations') ? 'text-blue-600' : 'text-gray-800'
                }`}
                onClick={() => {
                  navigate('/conversations');
                  setIsDropDownOpen(false);
                }}
              />
              {hasUnreadMessages && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </div>

            <Contact
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/friends') ? 'text-blue-600' : 'text-gray-800'
              }`}
              onClick={() => {
                navigate('/friends');
                setIsDropDownOpen(false);
              }}
            />
            <Bookmark
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/categories') ? 'text-blue-600' : 'text-gray-800'
              }`}
              onClick={() => {
                navigate('/categories');
                setIsDropDownOpen(false);
              }}
            />
            <BarChart3
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/statistics') ? 'text-blue-600' : 'text-gray-800'
              }`}
              onClick={() => {
                navigate('/statistics');
                setIsDropDownOpen(false);
              }}
            />
            <History
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/activities') ? 'text-blue-600' : 'text-gray-800'
              }`}
              onClick={() => {
                navigate('/activities');
                setIsDropDownOpen(false);
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-20 p-5 overflow-y-auto bg-white shadow-sm relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
