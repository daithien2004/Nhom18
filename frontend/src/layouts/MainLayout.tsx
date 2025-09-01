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
            src="https://scontent.fsgn24-1.fna.fbcdn.net/v/t39.30808-1/514259456_2306420366422587_4056087627011143100_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeEfcXmSWO9aKsSaH6L7ep4cQb7PBGQXHpNBvs8EZBcekysS_sNPNjpMuywfvwN8lDT8yHUtK95kaIltbKMHuzsb&_nc_ohc=H4b3ol0j80AQ7kNvwFKNAoG&_nc_oc=AdkiwPxbhRwKkqG5IlAVfehCmrbUHISGcGCNd2s9WOm3aClNnrPvWBMzMjFeea-0N3w&_nc_zt=24&_nc_ht=scontent.fsgn24-1.fna&_nc_gid=qFSIY1uGtI1ODnZYaQhhBA&oh=00_AfXhijs4NDzSomgX6t8Bu52IEW07RrjwVz7JybUfBGyNFg&oe=68BB9BE3"
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
