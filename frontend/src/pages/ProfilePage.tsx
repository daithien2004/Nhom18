import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProfile, updateProfileThunk } from "../store/slices/authSlice";
import { FaEdit } from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({ gender: "Other" });

  useEffect(() => {
    // Fetch profile khi component mount
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData(user); // copy dữ liệu user vào formData khi user load xong
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <button
          onClick={() => navigate("/")}
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
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
            >
              <FaEdit /> {isEditing ? "Cancel" : "Edit"}
            </button>
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
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
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
                {user?.phone || "Not provided"}
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
                  {user?.gender || "Not specified"}
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
                  value={formData.birthday || ""}
                  onChange={handleChange}
                  className="p-3 border rounded-lg w-full"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">
                  {user?.birthday
                    ? new Date(user.birthday).toLocaleDateString()
                    : "Not provided"}
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
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.isVerified ? "Verified" : "Not Verified"}
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
                value={formData.bio || ""}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full min-h-[100px]"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                {user?.bio || "No bio provided"}
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
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last updated:</span>
                <span className="ml-2 text-gray-800">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "N/A"}
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
                  // TODO: gọi API update profile
                  console.log("Updated Data:", formData);
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
    </div>
  );
};

export default ProfilePage;
