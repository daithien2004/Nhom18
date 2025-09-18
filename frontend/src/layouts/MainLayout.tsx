import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import {
  UserCircle,
  MessageCircle,
  Contact,
  Home,
  Bookmark,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropDownOpen(!isDropdownOpen);
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-blue-700 w-20 flex flex-col items-center py-6 justify-between fixed h-screen shadow-lg">
        <div className="flex flex-col items-center gap-6">
          {/* Avatar + Dropdown */}
          <div className="relative">
            <UserCircle
              size={48}
              className="text-white cursor-pointer hover:scale-110 transition-transform"
              onClick={toggleDropdown}
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <Home
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/home') ? 'text-yellow-300' : 'text-white'
              }`}
              onClick={() => navigate('/')}
            />

            <MessageCircle
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/messages') ? 'text-yellow-300' : 'text-white'
              }`}
              onClick={() => navigate('/messages')}
            />

            <Contact
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/friends') ? 'text-yellow-300' : 'text-white'
              }`}
              onClick={() => navigate('/friends')}
            />
            <Bookmark
              size={32}
              className={`cursor-pointer transition-transform hover:scale-110 ${
                isActive('/categories') ? 'text-yellow-300' : 'text-white'
              }`}
              onClick={() => navigate('/categories')}
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-20 p-5 overflow-y-auto">
        <Outlet />
      </main>

      {/* Dropdown dùng portal */}
      {isDropdownOpen &&
        createPortal(
          <div
            className="absolute left-20 top-6 w-48 bg-white shadow-lg rounded-lg z-[9999]"
            style={{ minWidth: 200 }}
          >
            <ul>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate('/profile');
                  setIsDropDownOpen(false);
                }}
              >
                Hồ sơ của bạn
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate('/setting');
                  setIsDropDownOpen(false);
                }}
              >
                Cài đặt
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleLogout();
                  setIsDropDownOpen(false);
                }}
              >
                Đăng xuất
              </li>
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MainLayout;
