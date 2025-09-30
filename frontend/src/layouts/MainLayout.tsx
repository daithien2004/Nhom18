import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import {
  UserCircle,
  MessageCircle,
  Contact,
  Home,
  Bookmark,
  BarChart3,
  History,
} from "lucide-react";

const MainLayout: React.FC = () => {
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropDownOpen(!isDropdownOpen);
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="bg-white w-20 flex flex-col items-center py-6 justify-between fixed h-screen shadow-md">
        <div className="flex flex-col items-center gap-6">
          {/* Avatar + Dropdown */}
          <div className="relative">
            <UserCircle
              size={48}
              className="text-gray-800 cursor-pointer hover:scale-110 transition-transform"
              onClick={toggleDropdown}
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <div className="relative group">
              <Home
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive("/home") ? "text-blue-600" : "text-gray-800"
                }`}
                onClick={() => navigate("/")}
              />
            </div>
            <div className="relative group">
              <MessageCircle
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive("/conversations") ? "text-blue-600" : "text-gray-800"
                }`}
                onClick={() => navigate("/conversations")}
              />
            </div>
            <div className="relative group">
              <Contact
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive("/friends") ? "text-blue-600" : "text-gray-800"
                }`}
                onClick={() => navigate("/friends")}
              />
            </div>
            <div className="relative group">
              <Bookmark
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive("/categories") ? "text-blue-600" : "text-gray-800"
                }`}
                onClick={() => navigate("/categories")}
              />
            </div>
            <div className="relative group">
              <BarChart3
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive("/statistics") ? "text-blue-600" : "text-gray-800"
                }`}
                onClick={() => navigate("/statistics")}
              />
            </div>
            <div className="relative group">
              <History
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  isActive("/activities") ? "text-blue-600" : "text-gray-800"
                }`}
                onClick={() => navigate("/activities")}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-20 p-5 overflow-y-auto bg-white shadow-sm">
        <Outlet />
      </main>

      {/* Dropdown dùng portal */}
      {isDropdownOpen &&
        createPortal(
          <div
            className="absolute left-20 top-6 w-48 bg-white shadow-md border border-gray-200 rounded-lg z-[9999]"
            style={{ minWidth: 200 }}
          >
            <ul>
              <li
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                onClick={() => {
                  navigate("/profile");
                  setIsDropDownOpen(false);
                }}
              >
                Hồ sơ của bạn
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                onClick={() => {
                  navigate("/setting");
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default MainLayout;
