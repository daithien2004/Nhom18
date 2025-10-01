import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Search, MoreVertical, Users } from 'lucide-react';
import { fetchFriends } from '../store/slices/friendSlice';
import {
  clearResults,
  searchFriends,
} from '../store/slices/friendListSearchSlice';
import type { ChatUser } from '../types/message';

// Thêm prop onFriendClick vào FriendList
interface FriendListProps {
  onFriendClick: (friend: ChatUser) => void;
}

export default function FriendList({ onFriendClick }: FriendListProps) {
  const dispatch = useAppDispatch();
  const { friends, isLoadingFriends, isError } = useAppSelector(
    (state) => state.friends
  );
  const friendListSearchState = useAppSelector(
    (state) => state.friendListSearch
  );

  const searchResults = friendListSearchState?.results || [];
  const isSearching = friendListSearchState?.isLoading || false;
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchFriends());
    return () => {
      dispatch(clearResults());
    };
  }, [dispatch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() !== '') {
        dispatch(searchFriends(searchText));
      } else {
        dispatch(clearResults());
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText, dispatch]);

  const dataToShow =
    searchResults.length > 0 || searchText.trim() !== ''
      ? searchResults
      : friends;

  const groupedFriends = useMemo(() => {
    const groups: Record<string, typeof dataToShow> = {};
    dataToShow.forEach((f) => {
      const firstChar = f.username[0].toUpperCase();
      if (!groups[firstChar]) groups[firstChar] = [];
      groups[firstChar].push(f);
    });
    return Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {} as Record<string, typeof dataToShow>);
  }, [dataToShow]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border">
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách bạn bè
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-gray-200">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-full bg-gray-100 px-12 py-2 text-sm text-gray-700 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
      </div>

      {/* Friend list */}
      <div className="flex-1 overflow-y-auto">
        {(isLoadingFriends || isSearching) && (
          <p className="text-center text-gray-500 mt-6">Đang tải...</p>
        )}
        {isError && (
          <p className="text-center text-red-500 mt-6">Lỗi tải dữ liệu</p>
        )}
        {!isLoadingFriends &&
          !isSearching &&
          Object.keys(groupedFriends).length === 0 && (
            <p className="text-gray-500 text-center mt-6">
              Không tìm thấy bạn bè
            </p>
          )}

        {Object.entries(groupedFriends).map(([letter, friends]) => (
          <div key={letter} className="mb-4">
            <h4 className="px-5 py-1 text-gray-500 font-semibold">{letter}</h4>
            {friends.map((f) => (
              <div
                key={f.id}
                // Thêm sự kiện onClick để gọi onFriendClick
                onClick={() => onFriendClick(f)}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition rounded-xl"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img
                      src={f.avatar || '/default-avatar.png'}
                      alt={f.username}
                      className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        f.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-gray-800 truncate">
                      {f.username}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      Bạn bè
                    </span>
                  </div>
                </div>

                <MoreVertical
                  size={18}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
