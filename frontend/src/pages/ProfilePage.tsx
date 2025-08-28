import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProfile } from '../store/slices/authSlice';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch profile khi component mount
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <img src="./img/logo.png" alt="ZALOUTE Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-gray-800">ZALOUTE</h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </header>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Profile</h2>
          </div>

          {/* Avatar Section */}
          <div className="mb-8 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-500">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{user?.username}</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{user?.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">
                {user?.phone || 'Not provided'}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <p className="p-3 bg-gray-50 rounded-lg capitalize">
                {user?.gender || 'Not specified'}
              </p>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthday
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">
                {user?.birthday
                  ? new Date(user.birthday).toLocaleDateString()
                  : 'Not provided'}
              </p>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user?.isVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user?.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <p className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
              {user?.bio || 'No bio provided'}
            </p>
          </div>

          {/* Account Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Member since:</span>
                <span className="ml-2 text-gray-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last updated:</span>
                <span className="ml-2 text-gray-800">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
