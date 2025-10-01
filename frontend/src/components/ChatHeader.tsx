import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendFriendRequest } from '../store/slices/friendSlice';
import { Settings } from 'lucide-react';
import { toast } from 'react-toastify';

interface ChatHeaderProps {
  user: {
    id: string;
    username: string;
    avatar?: string;
    status: 'friend' | 'pending' | 'none';
    isOnline?: boolean;
    isGroup?: boolean;
  };
  conversationId: string;
  settings: {
    theme: string;
    customEmoji: string;
    notificationsEnabled: boolean;
  };
  showSettingsMenu: boolean;
  setShowSettingsMenu: (value: boolean) => void;
  setShowEmojiPicker: (value: boolean) => void;
  setIsChoosingCustomEmoji: (value: boolean) => void;
  handleChangeTheme: (themeValue: string) => void;
  handleToggleNotifications: () => void;
  handleResetEmoji: () => void;
}

const themes = [
  { name: 'Mặc định', value: 'bg-gray-50' },
  { name: 'Xanh lam', value: 'bg-blue-100' },
  { name: 'Xanh lá', value: 'bg-green-100' },
  { name: 'Hồng', value: 'bg-pink-100' },
];

export default function ChatHeader({
  user,
  settings,
  showSettingsMenu,
  setShowSettingsMenu,
  setShowEmojiPicker,
  setIsChoosingCustomEmoji,
  handleChangeTheme,
  handleToggleNotifications,
  handleResetEmoji,
}: ChatHeaderProps) {
  const dispatch = useAppDispatch();
  const outgoingRequests = useAppSelector(
    (state) => state.friends.outgoingRequests
  );
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const isPending = outgoingRequests.some((r) => r.id === user.id);

  const handleAddFriend = async () => {
    try {
      await dispatch(sendFriendRequest(user.id)).unwrap();
      toast.success(`Đã gửi lời mời kết bạn tới ${user.username}`);
    } catch (err) {
      toast.error('Gửi lời mời kết bạn thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div
        className="flex items-center gap-3 cursor-pointer relative hover:bg-blue-50 transition-all duration-300 rounded-lg p-2"
        onClick={() => setShowSettingsMenu(!showSettingsMenu)}
      >
        <div className="relative w-10 h-10">
          <img
            src={
              user.isGroup ? '/group.png' : user.avatar || '/default-avatar.png'
            }
            alt={user.username}
            className="w-full h-full rounded-full object-cover shadow-sm"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              user.isGroup ? '' : user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800 truncate">
            {user.username}
          </span>
          <span className="text-xs text-gray-500">
            {user.isGroup
              ? 'Nhóm'
              : user.status === 'friend'
              ? 'Bạn bè'
              : 'Người lạ'}
          </span>
        </div>
        <Settings
          size={18}
          className="text-gray-600 hover:text-blue-600 transition-all duration-300"
        />
        {/* Menu cài đặt */}
        {showSettingsMenu && (
          <div
            ref={settingsMenuRef}
            className="absolute top-12 left-0 bg-white rounded-lg shadow-md p-4 z-10 w-64 transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Cài đặt
            </h3>
            <button
              onClick={() => {
                setIsChoosingCustomEmoji(true);
                setShowEmojiPicker(true);
              }}
              className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              Đổi emoji tùy chỉnh
            </button>
            {settings.customEmoji !== '👍' && (
              <button
                onClick={handleResetEmoji}
                className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                Gỡ emoji tùy chỉnh (quay lại 👍)
              </button>
            )}
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Chủ đề</h4>
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleChangeTheme(t.value)}
                  className={`w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ${
                    settings.theme === t.value ? 'bg-blue-50' : ''
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleToggleNotifications}
              className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 mt-2"
            >
              {settings.notificationsEnabled
                ? 'Tắt thông báo'
                : 'Bật thông báo'}
            </button>
          </div>
        )}
      </div>

      {user.status === 'none' && (
        <button
          onClick={handleAddFriend}
          disabled={isPending}
          className={`text-sm px-3 py-1 rounded-lg transition-all duration-300 ${
            isPending
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          {isPending ? 'Đã gửi lời mời' : 'Kết bạn'}
        </button>
      )}
    </div>
  );
}
