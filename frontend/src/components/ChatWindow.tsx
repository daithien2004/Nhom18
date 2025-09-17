import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchOutgoingRequests,
  sendFriendRequest,
} from '../store/slices/friendSlice';

interface ChatWindowProps {
  user: {
    _id: string;
    username: string;
    avatar?: string;
    status: 'friend' | 'pending' | 'none';
    isOnline?: boolean;
  };
}

interface Message {
  id: number;
  fromMe: boolean;
  text: string;
}

export default function ChatWindow({ user }: ChatWindowProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOutgoingRequests());
  }, []);

  const outgoingRequests = useAppSelector(
    (state) => state.friends.outgoingRequests
  );

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, fromMe: false, text: 'Chào bạn!' },
    { id: 2, fromMe: true, text: 'Chào bạn, bạn khỏe không?' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() === '') return;
    setMessages([
      ...messages,
      { id: messages.length + 1, fromMe: true, text: inputText },
    ]);
    setInputText('');
  };

  const handleAddFriend = async () => {
    try {
      await dispatch(sendFriendRequest(user._id)).unwrap();
      alert(`Đã gửi lời mời kết bạn tới ${user.username}`);
    } catch (err) {
      console.error(err);
      alert('Gửi lời mời kết bạn thất bại. Vui lòng thử lại.');
    }
  };

  // Kiểm tra xem đã gửi lời mời hay chưa
  const isPending = outgoingRequests.some((r) => r._id === user._id);

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
            className={`text-sm border px-3 py-1 rounded-full transition cursor-pointer ${
              isPending
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'text-blue-600 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {isPending ? 'Đã gửi lời mời' : 'Kết bạn'}
          </button>
        )}
      </div>

      {/* Chat content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                msg.fromMe
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              } shadow-sm`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex p-4 border-t bg-white gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition cursor-pointer"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
