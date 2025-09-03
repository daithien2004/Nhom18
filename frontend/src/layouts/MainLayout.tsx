import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const MainLayout: React.FC = () => {
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout()); // clear redux state (user, token)
    navigate('/login'); // điều hướng về login
  };

  const toggleDropdown = () => {
    setIsDropDownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-blue-600 w-20 flex flex-col items-center py-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src="https://cdn-icons-png.flaticon.com/512/8792/8792047.png"
            alt="User Avatar"
            className="w-14 h-14 rounded-full cursor-pointer"
            onClick={toggleDropdown}
          />
          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
              <ul>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate('/profile')}
                >
                  Hồ sơ của bạn
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate('/setting')}
                >
                  Cài đặt
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </li>
              </ul>
            </div>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-5">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
