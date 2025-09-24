import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProfile,
  updateProfileThunk,
  updateAvatarThunk,
  updateCoverPhotoThunk,
} from '../store/thunks/authThunks';
import { FaEdit } from 'react-icons/fa';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header profile */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
          >
            <FaEdit /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Cover + Avatar */}
        <div className="relative w-full">
          {/* Cover */}
          <div className="h-40 w-full bg-gray-300 overflow-hidden relative rounded-md">
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
              <label className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-md shadow cursor-pointer hover:bg-gray-100 text-sm">
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
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-3xl text-gray-600 bg-gray-200">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>

              {isEditing && (
                <label className="absolute bottom-0 right-0 translate-x-2 translate-y-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100">
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
                    className="h-5 w-5 text-gray-600"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">{user?.username}</p>
            )}
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
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg capitalize">
                {user?.gender || 'Not specified'}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birthday
            </label>
            {isEditing ? (
              <input
                type="date"
                name="birthday"
                value={formData.birthday || ''}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">
                {user?.birthday
                  ? new Date(user.birthday).toLocaleDateString()
                  : 'Not provided'}
              </p>
            )}
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
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full min-h-[100px]"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
              {user?.bio || 'No bio provided'}
            </p>
          )}
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

        {isEditing && (
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                dispatch(updateProfileThunk(formData));
                setIsEditing(false);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
