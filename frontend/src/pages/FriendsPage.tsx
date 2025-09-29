import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Search, MessageCircle, Users, UserPlus } from 'lucide-react';
import FriendList from '../components/FriendList';
import FriendRequests from '../components/FriendRequests';
import ChatWindow from '../components/ChatWindow';
import {
  searchAllUsers,
  clearResults,
} from '../store/slices/friendSearchSlice';
import instance from '../api/axiosInstant';

interface ChatUser {
  id: string;
  username: string;
  avatar?: string;
  status: 'friend' | 'pending' | 'none';
  isOnline?: boolean;
  conversationId: string;
  chatStatus: string;
}

export default function FriendsPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchText, setSearchText] = useState('');
  const { results: searchResults = [] } = useAppSelector(
    (state) => state.friendSearch
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

  // Debounce search
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

  // Click outside to close dropdown
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
      const res = await instance.get(`/conversations/1on1/${user.id}`);
      const conversation = res.data;
      setActiveChatUser({
        ...user,
        conversationId: conversation.id,
        chatStatus: conversation.status,
      });
      setShowDropdown(false);
      setSearchText('');
      dispatch(clearResults());
    } catch (err) {
      console.error('Lỗi khi lấy conversation:', err);
    }
  };

  return (
    <div className="flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white fixed h-screen shadow-md p-6 flex flex-col">
        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg bg-gray-100 px-12 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
          />
          {/* Dropdown search */}
          {showDropdown && searchResults.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-md border border-gray-200 max-h-96 overflow-y-auto z-50"
            >
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition-all duration-300"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img
                        src={user.avatar || 'https://via.placeholder.com/48'}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover border border-gray-100"
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
                    className="text-gray-500 hover:text-blue-600 transition-all duration-300 ml-4 flex-shrink-0"
                    size={16}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs FriendList / FriendRequests */}
        <nav className="flex flex-col space-y-2 flex-1">
          <button
            onClick={() => {
              setActiveTab('friends');
              setActiveChatUser(null);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-50 ${
              activeTab === 'friends'
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : 'text-gray-800'
            }`}
          >
            <Users size={18} />
            <span className="text-sm font-medium">Danh sách bạn bè</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('requests');
              setActiveChatUser(null);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-50 ${
              activeTab === 'requests'
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : 'text-gray-800'
            }`}
          >
            <UserPlus size={18} />
            <span className="text-sm font-medium">Lời mời kết bạn</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
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
        </div>
      </main>
    </div>
  );
}
