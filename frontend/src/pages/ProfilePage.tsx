import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProfile,
  updateProfileThunk,
  updateAvatarThunk,
  updateCoverPhotoThunk,
} from '../store/thunks/authThunks';
import { Edit, Loader2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({ gender: 'Other' });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading.fetchProfile) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="animate-spin w-4 h-4" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-20 p-5 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Header profile */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-1 transition-all duration-300"
            >
              <Edit size={16} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Cover + Avatar */}
          <div className="relative w-full">
            {/* Cover */}
            <div className="h-40 w-full bg-gray-100 overflow-hidden relative rounded-2xl shadow-md">
              {user?.coverPhoto ? (
                <img
                  src={user.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://cdn.xtmobile.vn/vnt_upload/news/06_2024/hinh-nen-may-tinh-de-thuong-cho-nu-8-xtmobile.jpg"
                  alt="Default Cover"
                  className="w-full h-full object-cover"
                />
              )}
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 text-sm text-gray-600 transition-all duration-300">
                  Change Cover
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        dispatch(updateCoverPhotoThunk(e.target.files[0]));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Avatar */}
            <div className="absolute left-6 -bottom-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-full shadow-md overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-3xl text-gray-600 bg-gray-100">
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 translate-x-2 translate-y-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-300">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          dispatch(updateAvatarThunk(e.target.files[0]));
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 11a3 3 0 100 6 3 3 0 000-6z"
                      />
                    </svg>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 ml-6" />

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleChange}
                  className="p-3 bg-gray-100 border-none rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg text-gray-800">
                  {user?.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <p className="p-3 bg-gray-100 rounded-lg text-gray-800">
                {user?.email}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone
              </label>
              <p className="p-3 bg-gray-100 rounded-lg text-gray-800">
                {user?.phone || 'Not provided'}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="p-3 bg-gray-100 border-none rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg text-gray-800 capitalize">
                  {user?.gender || 'Not specified'}
                </p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Birthday
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday || ''}
                  onChange={handleChange}
                  className="p-3 bg-gray-100 border-none rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg text-gray-800">
                  {user?.birthday
                    ? new Date(user.birthday).toLocaleDateString()
                    : 'Not provided'}
                </p>
              )}
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Verification Status
              </label>
              <p className="p-3 bg-gray-100 rounded-lg">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user?.isVerified
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {user?.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                className="p-3 bg-gray-100 border-none rounded-lg w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
            ) : (
              <p className="p-3 bg-gray-100 rounded-lg text-gray-800 min-h-[100px]">
                {user?.bio || 'No bio provided'}
              </p>
            )}
          </div>

          {/* Account Info */}
          <div className="mt-8 pt-6">
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

          {isEditing && (
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(updateProfileThunk(formData));
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
