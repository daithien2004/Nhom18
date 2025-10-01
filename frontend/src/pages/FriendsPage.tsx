import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  Search,
  MessageCircle,
  Users,
  UserPlus,
  Plus,
  Group,
} from 'lucide-react';
import FriendList from '../components/FriendList';
import FriendRequests from '../components/FriendRequests';
import ChatWindow from '../components/ChatWindow';
import {
  searchAllUsers,
  clearResults,
} from '../store/slices/friendSearchSlice';
import {
  searchConversations,
  clearSearchConversations,
} from '../store/slices/conversationSlice';
import instance from '../api/axiosInstant';
import { Dialog, Transition } from '@headlessui/react';
import type { ChatUser, Conversation } from '../types/message';
import { toast } from 'react-toastify';

export default function FriendsPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchText, setSearchText] = useState('');
  const { results: userSearchResults = [] } = useAppSelector(
    (state) => state.friendSearch
  );
  const { searchConversations: groupSearchResults = [] } = useAppSelector(
    (state) => state.conversations
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  // State cho modal tạo nhóm chat
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchGroupText, setSearchGroupText] = useState('');
  const { results: groupMemberSearchResults = [] } = useAppSelector(
    (state) => state.friendSearch
  );

  // Unified search for users and groups
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() !== '') {
        dispatch(searchAllUsers(searchText));
        dispatch(searchConversations(searchText));
        setShowDropdown(true);
      } else {
        dispatch(clearResults());
        dispatch(clearSearchConversations());
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText, dispatch]);

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

  // Handle click on user or group
  const handleUserOrGroupClick = async (item: ChatUser | Conversation) => {
    try {
      let conversation: Conversation;
      if ('isGroup' in item && item.isGroup) {
        conversation = item as Conversation;
      } else {
        const user = item as ChatUser;
        const res = await instance.get(`/conversations/1on1/${user.id}`);
        conversation = res.data;
      }
      setActiveConversation(conversation);
      setShowDropdown(false);
      setSearchText('');
      dispatch(clearResults());
      dispatch(clearSearchConversations());
    } catch (err) {
      console.error('Lỗi khi lấy conversation:', err);
    }
  };

  // Search for users to add to group
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchGroupText.trim() !== '' && showCreateGroupModal) {
        dispatch(searchAllUsers(searchGroupText));
      } else {
        dispatch(clearResults());
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchGroupText, dispatch, showCreateGroupModal]);

  // Add user to selectedUsers for group creation
  const addToGroup = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Remove user from selectedUsers
  const removeFromGroup = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0 || !groupName.trim()) {
      alert('Vui lòng chọn ít nhất 1 người và đặt tên nhóm');
      return;
    }

    try {
      const res = await instance.post('/conversations', {
        participants: selectedUsers,
        isGroup: true,
        groupName: groupName.trim(),
        groupAvatar,
      });

      const newConversation = res.data;
      setActiveConversation(newConversation);

      // Reset modal
      setGroupName('');
      setGroupAvatar('');
      setSelectedUsers([]);
      setSearchGroupText('');
      dispatch(clearResults());
      setShowCreateGroupModal(false);

      toast.success('Tạo nhóm chat thành công!');
    } catch (err) {
      toast.error('Lỗi khi tạo nhóm chat');
    }
  };

  return (
    <div className="flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white fixed h-screen shadow-md p-6 flex flex-col">
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè hoặc nhóm chat..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg bg-gray-100 px-12 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
          />
          {showDropdown &&
            (userSearchResults.length > 0 || groupSearchResults.length > 0) && (
              <div
                ref={dropdownRef}
                className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-md border border-gray-200 max-h-96 overflow-y-auto z-50"
              >
                {/* Group results */}
                {groupSearchResults.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition-all duration-300"
                    onClick={() => handleUserOrGroupClick(group)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <img
                          src={group.groupAvatar || '/group.png'}
                          alt={group.groupName}
                          className="w-full h-full rounded-full object-cover border border-gray-100"
                        />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {group.groupName || 'Nhóm chat'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {`${group.participants.length} thành viên`}
                        </span>
                      </div>
                    </div>
                    <MessageCircle
                      className="text-gray-500 hover:text-blue-600 transition-all duration-300 ml-4 flex-shrink-0"
                      size={16}
                    />
                  </div>
                ))}
                {/* User results */}
                {userSearchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition-all duration-300"
                    onClick={() => handleUserOrGroupClick(user)}
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
                          {user.status === 'active'
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

        <nav className="flex flex-col space-y-2 flex-1">
          <button
            onClick={() => {
              setActiveTab('friends');
              setActiveConversation(null);
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
              setActiveConversation(null);
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
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-50 text-gray-800"
          >
            <Group size={18} />
            <span className="text-sm font-medium">Tạo nhóm chat</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {activeConversation ? (
            <ChatWindow conversation={activeConversation} />
          ) : activeTab === 'friends' ? (
            <FriendList
              onFriendClick={(friend) => handleUserOrGroupClick(friend)}
            />
          ) : (
            <FriendRequests />
          )}
        </div>
      </main>

      {/* Modal Tạo Nhóm Chat */}
      <Transition appear show={showCreateGroupModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowCreateGroupModal(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Tạo Nhóm Chat
                  </Dialog.Title>

                  {/* Tên nhóm */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên nhóm
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Nhập tên nhóm..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Avatar nhóm (tùy chọn) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar nhóm (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={groupAvatar}
                      onChange={(e) => setGroupAvatar(e.target.value)}
                      placeholder="URL avatar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Chọn thành viên */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thêm thành viên
                    </label>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={searchGroupText}
                        onChange={(e) => setSearchGroupText(e.target.value)}
                        placeholder="Tìm kiếm bạn bè để thêm..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    {groupMemberSearchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 rounded-lg">
                        {groupMemberSearchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 hover:bg-white cursor-pointer"
                            onClick={() => addToGroup(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  user.avatar ||
                                  'https://via.placeholder.com/32'
                                }
                                alt={user.username}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="text-sm text-gray-800">
                                {user.username}
                              </span>
                            </div>
                            <Plus size={16} className="text-blue-600" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Danh sách thành viên đã chọn */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thành viên ({selectedUsers.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((userId) => {
                          const user = groupMemberSearchResults.find(
                            (u) => u.id === userId
                          ) || { username: 'Unknown' };
                          return (
                            <div
                              key={userId}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              <span>{user.username}</span>
                              <button
                                onClick={() => removeFromGroup(userId)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setShowCreateGroupModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={handleCreateGroup}
                    >
                      Tạo nhóm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
