import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout()); // clear redux state (user, token)
    navigate('/login'); // điều hướng về login
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <img src="./img/logo.png" alt="ZALOUTE Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-gray-800">ZALOUTE</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main>
        <h2 className="text-xl font-semibold mb-5">Welcome to ZALOUTE!</h2>
        <p className="mb-5 text-gray-700">
          This is your home page. You can add sections, cards, or links here to
          navigate through your application.
        </p>

        {/* Example sections */}
        <div className="grid grid-cols-3 gap-5">
          <Link
            to="/profile"
            className="bg-white shadow-md p-5 rounded-lg hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg mb-2">Profile</h3>
            <p>View and edit your profile.</p>
          </Link>
          <Link
            to="/settings"
            className="bg-white shadow-md p-5 rounded-lg hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg mb-2">Settings</h3>
            <p>Update your preferences and settings.</p>
          </Link>
          <Link
            to="/about"
            className="bg-white shadow-md p-5 rounded-lg hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg mb-2">About ZALOUTE</h3>
            <p>Learn more about our app.</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
