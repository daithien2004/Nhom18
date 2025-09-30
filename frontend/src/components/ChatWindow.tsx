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
} from '../store/slices/conversationSlice';
import { useChatSocket } from '../sockets/ChatSocketContext';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import type { Message } from '../types/message';
import instance from '../api/axiosInstant';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // State cho file đã chọn
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho input file

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  // Fetch outgoing requests
  useEffect(() => {
    dispatch(fetchOutgoingRequests());
  }, [dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      dispatch(selectConversation(conversationId));
      dispatch(fetchMessages({ conversationId, limit: 10 }));
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
      dispatch(addMessage({ conversationId, message }));
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, conversationId, dispatch]);

  // Xử lý gửi tin nhắn với văn bản và/hoặc ảnh
  const handleSend = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return; // Đảm bảo có văn bản hoặc file
    if (!conversationId || !currentUser) return;

    try {
      // Tải file lên server (sẽ triển khai endpoint này)
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await instance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(response.data.url);
      }

      // Gửi tin nhắn với văn bản và URL ảnh
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
        fileInputRef.current.value = ''; // Xóa input file
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
    <div className="flex flex-col h-full border rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border-b rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="w-full h-full rounded-full object-cover border border-gray-200"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                user.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 truncate">
              {user.username}
            </span>
            <span className="text-xs text-gray-500">
              {user.status === 'friend' ? 'Bạn bè' : 'Người lạ'}
            </span>
          </div>
        </div>

        {user.status === 'none' && (
          <button
            onClick={handleAddFriend}
            disabled={isPending}
            className={`text-sm border px-3 py-1 rounded-full transition ${
              isPending
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'text-blue-600 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {isPending ? 'Đã gửi lời mời' : 'Kết bạn'}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages[conversationId]?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender.id === currentUser?.id
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs ${
                msg.sender.id === currentUser?.id
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {/* Hiển thị văn bản nếu có */}
              {msg.text && <div>{msg.text}</div>}

              {/* Hiển thị ảnh đính kèm */}
              {(msg.attachments ?? []).length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.attachments?.map((attachment, index) => (
                    <img
                      key={index}
                      src={attachment}
                      alt={`Ảnh đính kèm ${index + 1}`}
                      className="max-w-full h-auto rounded-lg cursor-pointer"
                      onClick={() => window.open(attachment, '_blank')} // Mở ảnh trong tab mới khi nhấp
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {chatStatus === 'pending' && (
          <div className="text-center text-gray-500 mt-5 italic">
            Tin nhắn này đang chờ cho đến khi {user.username} chấp nhận kết bạn
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex p-4 border-t bg-white gap-2 items-center">
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
          <svg
            className="w-6 h-6 text-gray-600 hover:text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586M12 3v6m0 0H6m6 0h6"
            />
          </svg>
        </label>

        {/* Hiển thị tên file đã chọn */}
        {selectedFiles.length > 0 && (
          <div className="text-sm text-gray-600">
            {selectedFiles.map((file) => file.name).join(', ')}
          </div>
        )}

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-full border px-4 py-2 outline-none disabled:opacity-50"
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
          className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:bg-gray-300"
        >
          {sendingMessage ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Gửi'
          )}
        </button>
      </div>
    </div>
  );
}
