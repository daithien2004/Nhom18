import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchProfile,
  updateProfileThunk,
  updateAvatarThunk,
  updateCoverPhotoThunk,
} from "../store/thunks/authThunks";
import { Edit, Loader2, ImageIcon } from "lucide-react";
import PostSection from "../components/PostSection";
import {
  resetPosts,
  fetchPostsThunk,
  createPost,
} from "../store/slices/postSlice";
import instance from "../api/axiosInstant";
import type { Post } from "../types/post";
import { toast } from "react-toastify";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { isCreating, createError } = useAppSelector((state) => state.posts);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({ gender: "Other" });
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newPost, setNewPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) setFormData(user);
    dispatch(resetPosts());
    dispatch(
      fetchPostsThunk({ page: 1, limit: 20, replace: true, isMyPosts: true })
    );
  }, [user, dispatch]);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("image", file);
      try {
        const res = await instance.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      } catch (err) {
        toast.error("Tải ảnh lên thất bại!");
      }
    }
    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`Tải lên ${uploadedUrls.length} ảnh thành công!`);
    }
  };

  const handleCreatePost = async () => {
    if (!content && images.length === 0) return;
    try {
      const result = await dispatch(createPost({ content, images })).unwrap();
      setContent("");
      setImages([]);
      setNewPost(result);
      setIsModalOpen(false);
      toast.success("Đăng bài thành công!");
      dispatch(resetPosts());
      dispatch(
        fetchPostsThunk({ page: 1, limit: 20, replace: true, isMyPosts: true })
      );
    } catch {
      toast.error("Đăng bài thất bại!");
    }
  };

  if (loading.fetchProfile) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="animate-spin w-5 h-5 mr-2 text-gray-500" />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 ml-20 p-5 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cover + Avatar */}
        <div className="relative bg-white rounded-lg shadow">
          <div className="h-56 w-full">
            <img
              src={
                user?.coverPhoto ||
                "https://cdn.xtmobile.vn/vnt_upload/news/06_2024/hinh-nen-may-tinh-de-thuong-cho-nu-8-xtmobile.jpg"
              }
              alt="Cover"
              className="w-full h-full object-cover rounded-t-lg"
            />
            {isEditing && (
              <label className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-lg shadow cursor-pointer text-sm text-gray-600 hover:bg-gray-100">
                Đổi ảnh bìa
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      dispatch(updateCoverPhotoThunk(e.target.files[0]));
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className="absolute left-6 -bottom-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow overflow-hidden">
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
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        dispatch(updateAvatarThunk(e.target.files[0]));
                      }
                    }}
                  />
                  <ImageIcon size={16} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mt-20 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{user?.username}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50"
          >
            <Edit size={16} />
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        {/* Layout 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Cột trái: Thông tin cá nhân */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <h2 className="font-semibold mb-2 text-lg text-center">
              Thông tin cá nhân
            </h2>
            {/* Username */}
            <div>
              <span className="font-medium">Username: </span>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                />
              ) : (
                <span>{user?.username}</span>
              )}
            </div>
            {/* Email */}
            <div>
              <span className="font-medium">Email: </span>
              <span>{user?.email}</span>
            </div>
            {/* Phone */}
            <div>
              <span className="font-medium">Phone: </span>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                />
              ) : (
                <span>{user?.phone || "Chưa có"}</span>
              )}
            </div>
            {/* Gender */}
            <div>
              <span className="font-medium">Gender: </span>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender || "Other"}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              ) : (
                <span>{user?.gender || "Other"}</span>
              )}
            </div>
            {/* Birthday */}
            <div>
              <span className="font-medium">Birthday: </span>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday || ""}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg"
                />
              ) : (
                <span>
                  {user?.birthday
                    ? new Date(user.birthday).toLocaleDateString()
                    : "Chưa có"}
                </span>
              )}
            </div>
            {/* Bio */}
            <div>
              <span className="font-medium">Bio: </span>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-lg resize-none"
                  rows={3}
                />
              ) : (
                <p>{user?.bio || "Chưa có tiểu sử"}</p>
              )}
            </div>

            {/* Save buttons */}
            {isEditing && (
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    dispatch(updateProfileThunk(formData));
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Cột phải: tạo bài viết + bài viết */}
          <div className="md:col-span-2 space-y-4">
            {/* Tạo post */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex gap-3">
                <img
                  src={user?.avatar || "https://via.placeholder.com/48"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => setIsModalOpen(true)}
                >
                  Bạn đang nghĩ gì?
                </div>
              </div>
            </div>

            {/* Bài viết */}
            <PostSection isMyPosts newPost={newPost} showTabs={false} />
          </div>
        </div>
      </div>

      {/* Modal tạo post */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Tạo bài viết</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none bg-gray-100"
              placeholder="Bạn đang nghĩ gì thế?"
              rows={4}
            />
            <div className="flex justify-between mt-2">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <ImageIcon size={18} /> Thêm ảnh
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white w-6 h-6 rounded-full hidden group-hover:flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {createError && (
              <div className="text-red-500 text-sm mt-2">{createError}</div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isCreating || (!content && images.length === 0)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="animate-spin w-4 h-4 inline mr-1" />
                ) : null}
                {isCreating ? "Đang đăng..." : "Đăng bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
