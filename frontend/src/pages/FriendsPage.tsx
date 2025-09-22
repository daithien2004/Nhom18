import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MessageCircle, Users, UserPlus } from 'lucide-react';
import FriendList from '../components/FriendList';
import FriendRequests from '../components/FriendRequests';
import ChatWindow from '../components/ChatWindow';
import {
  searchAllUsers,
  clearResults,
} from '../store/slices/friendSearchSlice';
import type { RootState, AppDispatch } from '../store/store';
import instance from '../api/axiosInstant';

interface ChatUser {
  _id: string;
  username: string;
  avatar?: string;
  status: 'friend' | 'pending' | 'none';
  isOnline?: boolean;
  conversationId: string;
  chatStatus: string;
}

export default function FriendsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchText, setSearchText] = useState('');

  const { results: searchResults = [], isLoading } = useSelector(
    (state: RootState) => state.friendSearch
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

  // debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() !== '') {
        dispatch(searchAllUsers(searchText));
        setShowDropdown(true);
      } else {
        dispatch(clearResults());
        setShowDropdown(false);
      }
    }, 100);

    return () => clearTimeout(delayDebounce);
  }, [searchText, dispatch]);

  // click ngoài dropdown để đóng
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = async (user: any) => {
    try {
      const res = await instance.get(`/conversations/1on1/${user._id}`);
      const conversation = res.data;

      setActiveChatUser({
        ...user,
        conversationId: conversation._id,
        chatStatus: conversation.status, // 👈 active / pending
      });

      setShowDropdown(false);
      setSearchText('');
      dispatch(clearResults());
    } catch (err) {
      console.error('Lỗi khi lấy conversation:', err);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex-shrink-0 flex flex-col rounded-r-2xl shadow-lg h-screen relative">
        {/* Search */}
        <div className="p-5 relative">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-full bg-gray-100 px-14 py-3 text-sm text-gray-700 placeholder-gray-400 
                 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Dropdown search */}
          {showDropdown && searchResults.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50"
            >
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {user.username}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {user.status === 'friend'
                          ? 'Bạn bè'
                          : user.status === 'pending'
                          ? 'Đang chờ'
                          : 'Người lạ'}
                      </span>
                    </div>
                  </div>
                  <MessageCircle
                    className="text-gray-500 hover:text-blue-500 transition-colors ml-4 flex-shrink-0"
                    size={20}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs FriendList / FriendRequests */}
        <nav className="flex flex-col mt-4 px-3 space-y-2">
          <button
            onClick={() => {
              setActiveTab('friends');
              setActiveChatUser(null);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition hover:bg-blue-50  ${
              activeTab === 'friends'
                ? 'bg-blue-100 font-semibold text-blue-600'
                : 'text-gray-700'
            }`}
          >
            <Users size={20} />
            <span>Danh sách bạn bè</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('requests');
              setActiveChatUser(null);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition hover:bg-blue-50 ${
              activeTab === 'requests'
                ? 'bg-blue-100 font-semibold text-blue-600'
                : 'text-gray-700'
            }`}
          >
            <UserPlus size={20} />
            <span>Lời mời kết bạn</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {activeChatUser ? (
          <ChatWindow
            user={activeChatUser}
            conversationId={activeChatUser.conversationId}
            chatStatus={activeChatUser.chatStatus}
          />
        ) : activeTab === 'friends' ? (
          <FriendList />
        ) : (
          <FriendRequests />
        )}
      </main>
    </div>
  );
}
