import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchOutgoingRequests,
  sendFriendRequest,
} from '../store/slices/friendSlice';
import {
  fetchMessages,
  sendMessage,
  selectConversation,
  addMessage,
  fetchConversationSettings,
  updateConversationSettings,
  addMessageReaction,
  type ConversationSettings,
  updateSettings,
} from '../store/slices/conversationSlice';
import { useChatSocket } from '../sockets/ChatSocketContext';
import { toast } from 'react-toastify';
import { Loader2, Paperclip, Smile, Settings } from 'lucide-react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import type { Message } from '../types/message';
import instance from '../api/axiosInstant';

// Các chủ đề có sẵn
const themes = [
  { name: 'Mặc định', value: 'bg-gray-50' },
  { name: 'Xanh lam', value: 'bg-blue-100' },
  { name: 'Xanh lá', value: 'bg-green-100' },
  { name: 'Hồng', value: 'bg-pink-100' },
];

// Danh sách emoji cảm xúc
const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ChatWindowProps {
  user: {
    id: string;
    username: string;
    avatar?: string;
    status: 'friend' | 'pending' | 'none';
    isOnline?: boolean;
  };
  conversationId: string;
  chatStatus: string;
}

export default function ChatWindow({
  user,
  conversationId,
  chatStatus,
}: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const socket = useChatSocket();
  const { messages, sendingMessage, error } = useAppSelector(
    (state) => state.conversations
  );
  const outgoingRequests = useAppSelector(
    (state) => state.friends.outgoingRequests
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null); // ID tin nhắn hiển thị menu cảm xúc
  const [isChoosingCustomEmoji, setIsChoosingCustomEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);

  const settings = useAppSelector(
    (state) => state.conversations.settings[conversationId]
  ) || {
    theme: 'bg-gray-50',
    customEmoji: '👍',
    notificationsEnabled: true,
  };

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  // Xử lý chọn emoji từ EmojiPicker
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Xử lý chọn emoji tùy chỉnh
  const handleCustomEmojiClick = (emojiData: EmojiClickData) => {
    dispatch(
      updateConversationSettings({
        conversationId,
        settings: { customEmoji: emojiData.emoji },
      })
    );
    setIsChoosingCustomEmoji(false);
    setShowEmojiPicker(false);
    setShowSettingsMenu(false);
  };

  // Xử lý gỡ emoji tùy chỉnh
  const handleResetEmoji = () => {
    dispatch(
      updateConversationSettings({
        conversationId,
        settings: { customEmoji: '👍' },
      })
    );
    setShowSettingsMenu(false);
  };

  // Xử lý đổi chủ đề
  const handleChangeTheme = (themeValue: string) => {
    dispatch(
      updateConversationSettings({
        conversationId,
        settings: { theme: themeValue },
      })
    );
    setShowSettingsMenu(false);
  };

  // Xử lý bật/tắt thông báo
  const handleToggleNotifications = () => {
    dispatch(
      updateConversationSettings({
        conversationId,
        settings: { notificationsEnabled: !settings.notificationsEnabled },
      })
    );
    setShowSettingsMenu(false);
  };

  // Xử lý chọn phản ứng
  const handleReactionClick = (messageId: string, emoji: string) => {
    if (currentUser) {
      dispatch(
        addMessageReaction({
          conversationId,
          messageId,
          userId: currentUser.id,
          emoji,
        })
      );
    }
    setShowReactionMenu(null);
  };

  // Xử lý gửi nút Like hoặc emoji tùy chỉnh
  const handleSendLike = async () => {
    if (!conversationId || !currentUser || sendingMessage) return;

    try {
      await dispatch(
        sendMessage({
          conversationId,
          text: settings.customEmoji,
          attachments: [],
        })
      ).unwrap();
    } catch (err) {
      // Lỗi được xử lý trong Redux
    }
  };

  // Đóng menu cài đặt hoặc menu cảm xúc khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
      if (
        reactionMenuRef.current &&
        !reactionMenuRef.current.contains(event.target as Node)
      ) {
        setShowReactionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch outgoing requests
  useEffect(() => {
    dispatch(fetchOutgoingRequests());
  }, [dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      dispatch(selectConversation(conversationId));
      dispatch(fetchMessages({ conversationId, limit: 10 }));
      dispatch(fetchConversationSettings(conversationId)); // Fetch settings từ backend
    }
  }, [conversationId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Setup WebSocket
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('joinConversation', conversationId);

    const handleNewMessage = (message: Message) => {
      if (settings.notificationsEnabled) {
        dispatch(addMessage({ conversationId, message }));
        if (message.sender.id !== currentUser?.id) {
          toast.info(`Tin nhắn mới từ ${user.username}: ${message.text}`);
        }
      }
    };

    const handleSettingsUpdated = (data: {
      conversationId: string;
      settings: ConversationSettings;
    }) => {
      dispatch(
        updateSettings({
          conversationId: data.conversationId,
          settings: data.settings,
        })
      );
    };
    const handleReactionAdded = (data: {
      conversationId: string;
      messageId: string;
      reaction: { [userId: string]: string };
    }) => {
      dispatch({
        type: addMessageReaction.fulfilled.type,
        payload: {
          conversationId: data.conversationId,
          messageId: data.messageId,
          reaction: data.reaction,
        },
      });
    };

    socket.on('reactionAdded', handleReactionAdded);
    socket.on('newMessage', handleNewMessage);
    socket.on('settingsUpdated', handleSettingsUpdated);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('settingsUpdated', handleSettingsUpdated);
      socket.off('reactionAdded', handleReactionAdded);
    };
  }, [
    socket,
    conversationId,
    dispatch,
    settings.notificationsEnabled,
    user.username,
    currentUser,
  ]);

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;
    if (!conversationId || !currentUser) return;

    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await instance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(response.data.url);
      }

      await dispatch(
        sendMessage({
          conversationId,
          text: inputText,
          attachments: uploadedUrls,
        })
      ).unwrap();
      setInputText('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      // Lỗi được xử lý trong Redux
    }
  };

  const handleAddFriend = async () => {
    try {
      await dispatch(sendFriendRequest(user.id)).unwrap();
      toast.success(`Đã gửi lời mời kết bạn tới ${user.username}`);
    } catch (err) {
      toast.error('Gửi lời mời kết bạn thất bại. Vui lòng thử lại.');
    }
  };

  const isPending = outgoingRequests.some((r) => r.id === user.id);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md max-h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div
          className="flex items-center gap-3 cursor-pointer relative hover:bg-blue-50 transition-all duration-300 rounded-lg p-2"
          onClick={() => setShowSettingsMenu((prev) => !prev)}
        >
          <div className="relative w-10 h-10">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="w-full h-full rounded-full object-cover shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                user.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {user.username}
            </span>
            <span className="text-xs text-gray-500">
              {user.status === 'friend' ? 'Bạn bè' : 'Người lạ'}
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
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  Chủ đề
                </h4>
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

      {/* Messages */}
      <div
        className={`flex-1 p-4 overflow-y-auto space-y-3 ${settings.theme} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
      >
        {messages[conversationId]?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender.id === currentUser?.id
                ? 'justify-end'
                : 'justify-start'
            } relative group`}
            onClick={() => setShowReactionMenu(msg.id)}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs shadow-sm ${
                msg.sender.id === currentUser?.id
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              } transition-all duration-200 group-hover:bg-opacity-80 cursor-pointer`}
            >
              {msg.text && <div>{msg.text}</div>}
              {(msg.attachments ?? []).length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.attachments?.map((attachment, index) => (
                    <img
                      key={index}
                      src={attachment}
                      alt={`Ảnh đính kèm ${index + 1}`}
                      className="max-w-full h-auto rounded-lg cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(attachment, '_blank');
                      }}
                    />
                  ))}
                </div>
              )}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div
                  className={`absolute -bottom-2 ${
                    msg.sender.id === currentUser?.id ? 'right-2' : 'left-2'
                  } text-lg`}
                >
                  {Object.values(msg.reactions).join(' ')}
                </div>
              )}
            </div>
            {showReactionMenu === msg.id && (
              <div
                ref={reactionMenuRef}
                className="absolute -top-10 bg-white rounded-full shadow-md p-2 flex gap-2 z-10"
              >
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReactionClick(msg.id, emoji);
                    }}
                    className="text-lg hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {chatStatus === 'pending' && (
          <div className="text-center text-sm text-gray-500 mt-5 italic">
            Tin nhắn này đang chờ cho đến khi {user.username} chấp nhận kết bạn
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex p-4 bg-white shadow-sm gap-2 items-center relative">
        {/* Nút chọn file */}
        <label className="cursor-pointer">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Paperclip
            size={18}
            className="text-gray-600 hover:text-blue-600 transition-all duration-300"
          />
        </label>

        {/* Nút mở Emoji Picker */}
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-gray-600 hover:text-blue-600 transition-all duration-300"
        >
          <Smile size={18} />
        </button>

        {/* Nút Like hoặc emoji tùy chỉnh */}
        <button
          onClick={handleSendLike}
          disabled={sendingMessage || !currentUser}
          className="text-2xl hover:bg-gray-100 rounded-lg p-1 disabled:opacity-50 transition-all duration-300"
        >
          {settings.customEmoji}
        </button>

        {/* Hiển thị Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-10">
            <EmojiPicker
              onEmojiClick={
                isChoosingCustomEmoji
                  ? handleCustomEmojiClick
                  : handleEmojiClick
              }
            />
          </div>
        )}

        {/* Hiển thị tên file đã chọn */}
        {selectedFiles.length > 0 && (
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {selectedFiles.map((file) => file.name).join(', ')}
          </div>
        )}

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 disabled:opacity-50"
          disabled={sendingMessage || !currentUser}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !sendingMessage &&
              currentUser &&
              (inputText.trim() || selectedFiles.length > 0)
            ) {
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={
            sendingMessage ||
            !currentUser ||
            (!inputText.trim() && selectedFiles.length === 0)
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingMessage && <Loader2 className="w-4 h-4 animate-spin" />}
          Gửi
        </button>
      </div>
    </div>
  );
}
