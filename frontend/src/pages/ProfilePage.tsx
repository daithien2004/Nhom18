import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProfile,
  updateProfileThunk,
  updateAvatarThunk,
  updateCoverPhotoThunk,
} from '../store/thunks/authThunks';
import {
  Camera,
  Edit,
  Loader2,
  ImageIcon,
  X,
  UserPlus,
  Users,
} from 'lucide-react';
import PostSection from '../components/PostSection';
import {
  resetPosts,
  fetchPostsThunk,
  createPost,
} from '../store/slices/postSlice';
import { fetchFriends } from '../store/slices/friendSlice';
import instance from '../api/axiosInstant';
import type { Post } from '../types/post';
import { toast } from 'react-toastify';
import ReportButton from '../components/ReportButton';
import { reportService } from '../services/reportService';
import { useNavigate } from 'react-router-dom';

type TabType = 'posts' | 'about' | 'friends' | 'photos';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const {
    posts,
    initialLoading: isLoadingPosts,
    isCreating,
    createError,
  } = useAppSelector((state) => state.posts);
  const { friends, isLoadingFriends } = useAppSelector(
    (state) => state.friends
  );

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({ gender: 'Other' });
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newPost, setNewPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchFriends());
  }, [dispatch]);

  useEffect(() => {
    if (user) setFormData(user);
    dispatch(resetPosts());
    dispatch(
      fetchPostsThunk({
        page: 1,
        limit: 20,
        replace: true,
        userId: user?.id,
      })
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
      fd.append('image', file);
      try {
        const res = await instance.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(res.data.url);
      } catch (err) {
        toast.error('Tải ảnh lên thất bại!');
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
      setContent('');
      setImages([]);
      setNewPost(result);
      setIsModalOpen(false);
      toast.success('Đăng bài thành công!');
      dispatch(resetPosts());
      dispatch(
        fetchPostsThunk({
          page: 1,
          limit: 20,
          replace: true,
          userId: user?.id,
        })
      );
    } catch {
      toast.error('Đăng bài thất bại!');
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      console.log(formData);
      const updatedUser = await dispatch(updateProfileThunk(formData)).unwrap();
      setFormData(updatedUser); // Sync local formData with server response
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
      dispatch(fetchProfile()); // Refresh user data
    } catch (error) {
      toast.error('Cập nhật thông tin thất bại!');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Extract all images from posts
  const postImages = posts
    .filter((post) => post.images && post.images.length > 0)
    .flatMap((post) => post.images);

  if (loading.fetchProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header với Cover Photo */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Cover Photo */}
          <div className="relative h-[400px] bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden group">
            <img
              src={
                user?.coverPhoto ||
                'https://cdn.xtmobile.vn/vnt_upload/news/06_2024/hinh-nen-may-tinh-de-thuong-cho-nu-8-xtmobile.jpg'
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <label className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100">
              <Camera size={18} className="text-gray-700" />
              <span className="font-medium text-sm text-gray-700">
                Chỉnh sửa ảnh bìa
              </span>
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
          </div>

          {/* Profile Info Section */}
          <div className="px-4 pb-4">
            <div
              className="flex items-end justify-between"
              style={{ marginTop: '-80px' }}
            >
              {/* Avatar */}
              <div className="relative group">
                <div className="w-[168px] h-[168px] rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-6xl font-bold text-gray-600 bg-blue-100">
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
                  <Camera size={20} className="text-gray-700" />
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
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                >
                  <Edit size={16} />
                  {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa trang cá nhân'}
                </button>
              </div>
            </div>

            {/* Name & Bio */}
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.username}
              </h1>
              {user?.bio && <p className="text-gray-600 mt-1">{user.bio}</p>}
              <p className="text-gray-500 mt-1">{friends.length} bạn bè</p>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-6 py-3 font-semibold transition-all rounded-lg ${
                    activeTab === 'posts'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bài viết
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-6 py-3 font-semibold transition-all rounded-lg ${
                    activeTab === 'about'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Giới thiệu
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`px-6 py-3 font-semibold transition-all rounded-lg ${
                    activeTab === 'friends'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bạn bè
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-6 py-3 font-semibold transition-all rounded-lg ${
                    activeTab === 'photos'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto mt-4 px-4 pb-8">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-5 gap-4">
            {/* Left Sidebar - Intro */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Giới thiệu</h2>

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Tên
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Tiểu sử
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Mô tả về bản thân bạn"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={formData.gender || 'Other'}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        name="birthday"
                        value={
                          formData.birthday
                            ? new Date(formData.birthday)
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
                        disabled={isUpdatingProfile}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center"
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile && (
                          <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        )}
                        {isUpdatingProfile ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {user?.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">✉️</span>
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user?.bio && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">📝</span>
                        <span>{user.bio}</span>
                      </div>
                    )}
                    {user?.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">📱</span>
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user?.gender && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">
                          {user.gender === 'male'
                            ? '👨'
                            : user.gender === 'female'
                            ? '👩'
                            : '🧑'}
                        </span>
                        <span>
                          {user.gender === 'male'
                            ? 'Nam'
                            : user.gender === 'female'
                            ? 'Nữ'
                            : 'Khác'}
                        </span>
                      </div>
                    )}
                    {user?.birthday && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">🎂</span>
                        <span>
                          {new Date(user.birthday).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Friends Preview */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Bạn bè</h2>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Xem tất cả
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {friends.length} người bạn
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {friends.slice(0, 9).map((friend) => (
                    <div key={friend.id} className="relative group">
                      <img
                        src={friend.avatar || 'https://via.placeholder.com/100'}
                        alt={friend.username}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                        <p className="text-white text-xs font-semibold truncate">
                          {friend.username}
                        </p>
                      </div>
                      {friend.isOnline && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Posts */}
            <div className="col-span-3 space-y-4">
              {/* Create Post */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-3">
                  <img
                    src={user?.avatar || 'https://via.placeholder.com/48'}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div
                    className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-full px-4 py-3 cursor-pointer transition-all"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <span className="text-gray-500">Bạn đang nghĩ gì?</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 flex justify-around">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <ImageIcon size={20} className="text-green-500" />
                    <span className="font-semibold text-gray-600">
                      Ảnh/video
                    </span>
                  </button>
                </div>
              </div>

              {/* Posts */}
              <PostSection
                userId={user?.id}
                newPost={newPost}
                showTabs={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Giới thiệu</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiểu sử
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Mô tả về bản thân bạn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={formData.gender || 'Other'}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
                      disabled={isUpdatingProfile}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile && (
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      )}
                      {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-3">
                      {user?.email && (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✉️</span>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                      )}
                      {user?.bio && (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📝</span>
                          <div>
                            <p className="text-sm text-gray-500">Tiểu sử</p>
                            <p className="font-medium">{user.bio}</p>
                          </div>
                        </div>
                      )}
                      {user?.phone && (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📱</span>
                          <div>
                            <p className="text-sm text-gray-500">
                              Số điện thoại
                            </p>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      {user?.gender && (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {user.gender === 'male'
                              ? '👨'
                              : user.gender === 'female'
                              ? '👩'
                              : '🧑'}
                          </span>
                          <div>
                            <p className="text-sm text-gray-500">Giới tính</p>
                            <p className="font-medium">
                              {user.gender === 'male'
                                ? 'Nam'
                                : user.gender === 'female'
                                ? 'Nữ'
                                : 'Khác'}
                            </p>
                          </div>
                        </div>
                      )}
                      {user?.birthday && (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎂</span>
                          <div>
                            <p className="text-sm text-gray-500">Ngày sinh</p>
                            <p className="font-medium">
                              {new Date(user.birthday).toLocaleDateString(
                                'vi-VN'
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
                  >
                    Chỉnh sửa thông tin
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Bạn bè</h2>
              <p className="text-gray-600 mb-4">{friends.length} người bạn</p>

              {isLoadingFriends ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Chưa có bạn bè nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative">
                        <img
                          src={
                            friend.avatar || 'https://via.placeholder.com/200'
                          }
                          alt={friend.username}
                          className="w-full h-48 object-cover"
                        />
                        {friend.isOnline && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 truncate">
                          {friend.username}
                        </p>
                        <button
                          onClick={() => {
                            navigate(`/profile/${friend.id}`);
                          }}
                          className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                        >
                          Xem trang cá nhân
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Ảnh</h2>
              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                </div>
              ) : postImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Chưa có ảnh nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {postImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-white text-xs font-semibold">
                          Ảnh {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Create Post */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-bold text-gray-900">Tạo bài viết</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/48'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{user?.username}</span>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border-0 resize-none text-lg focus:ring-0 focus:outline-none"
                placeholder="Bạn đang nghĩ gì?"
                rows={4}
                autoFocus
              />

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg p-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute top-2 right-2 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    Thêm vào bài viết
                  </span>
                  <label className="cursor-pointer p-2 hover:bg-gray-50 rounded-full transition-all">
                    <ImageIcon size={24} className="text-green-500" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {createError && (
                <div className="mt-3 text-red-500 text-sm bg-red-50 p-2 rounded-lg">
                  {createError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4">
              <button
                onClick={handleCreatePost}
                disabled={isCreating || (!content && images.length === 0)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isCreating && <Loader2 className="animate-spin w-5 h-5" />}
                {isCreating ? 'Đang đăng...' : 'Đăng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
