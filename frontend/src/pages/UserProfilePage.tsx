import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  Loader2,
  ImageIcon,
  UserPlus,
  UserMinus,
  ArrowLeft,
} from 'lucide-react';
import PostSection from '../components/PostSection';
import { resetPosts, fetchPostsThunk } from '../store/slices/postSlice';
import {
  sendFriendRequest,
  acceptFriendRequest,
  unFriend,
  fetchOutgoingRequests,
} from '../store/slices/friendSlice';
import instance from '../api/axiosInstant';
import type { UserProfile } from '../types/user';
import type { Post } from '../types/post';
import { toast } from 'react-toastify';
import ReportButton from '../components/ReportButton';
import { reportService } from '../services/reportService';

type TabType = 'posts' | 'about' | 'photos';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { posts, initialLoading: isLoadingPosts } = useAppSelector(
    (state) => state.posts
  );
  const { friends } = useAppSelector((state) => state.friends);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = useMemo(() => {
    return currentUser && userId && currentUser.id === userId;
  }, [currentUser, userId]);

  // Check if user is friend using Redux store
  const isFriend = useMemo(() => {
    if (!userId || !friends) return false;
    return friends.some((friend) => friend.id === userId);
  }, [userId, friends]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      setIsLoadingProfile(true);
      try {
        const response = await instance.get(`/users/${userId}`);
        setUser(response.data.user);
      } catch (error) {
        toast.error('Không thể tải thông tin người dùng');
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [userId, isOwnProfile]);

  // Fetch user's posts
  useEffect(() => {
    if (userId) {
      dispatch(resetPosts());
      dispatch(
        fetchPostsThunk({
          page: 1,
          limit: 20,
          replace: true,
          userId: userId,
        })
      );
    }
  }, [userId, dispatch]);

  // Extract all images from posts
  const postImages = posts
    .filter((post) => post.images && post.images.length > 0)
    .flatMap((post) => post.images);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-gray-500 mb-4">Không tìm thấy người dùng</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Render friend action button
  const renderFriendButton = () => {
    // Don't show buttons on own profile
    if (isOwnProfile) return null;

    if (isProcessing) {
      return (
        <button
          disabled
          className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          <Loader2 size={16} className="animate-spin" />
          Đang xử lý...
        </button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
      </div>

      {/* Header với Cover Photo */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Cover Photo */}
          <div className="relative h-[400px] bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
            <img
              src={
                user?.coverPhoto ||
                'https://cdn.xtmobile.vn/vnt_upload/news/06_2024/hinh-nen-may-tinh-de-thuong-cho-nu-8-xtmobile.jpg'
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info Section */}
          <div className="px-4 pb-4">
            <div
              className="flex items-end justify-between"
              style={{ marginTop: '-80px' }}
            >
              {/* Avatar */}
              <div className="relative">
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
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-4">
                {!isOwnProfile && (
                  <ReportButton
                    reportType="user"
                    targetId={user.id}
                    targetName={user.username}
                    onReport={async (data) => {
                      try {
                        await reportService.createReport(data);
                        toast.success('Đã gửi báo cáo người dùng');
                      } catch {
                        toast.error('Gửi báo cáo thất bại');
                      }
                    }}
                  />
                )}
                {renderFriendButton()}
              </div>
            </div>

            {/* Name & Bio */}
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.username}
              </h1>
              {user?.bio && <p className="text-gray-600 mt-1">{user.bio}</p>}
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
                <div className="space-y-3 text-sm">
                  {user?.bio && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">📝</span>
                      <span>{user.bio}</span>
                    </div>
                  )}
                  {user?.phone && (isFriend || isOwnProfile) && (
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
              </div>
            </div>

            {/* Right Content - Posts */}
            <div className="col-span-3 space-y-4">
              <PostSection userId={userId} showTabs={false} />
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Giới thiệu</h2>
              <div className="space-y-4">
                <div className="pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Thông tin cơ bản
                  </h3>
                  <div className="space-y-3">
                    {user?.email && (isFriend || isOwnProfile) && (
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
                    {user?.phone && (isFriend || isOwnProfile) && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="text-sm text-gray-500">Số điện thoại</p>
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
              </div>
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
    </div>
  );
};

export default UserProfilePage;
