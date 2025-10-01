import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendMessage } from '../store/slices/conversationSlice';
import { Loader2, Paperclip, Smile } from 'lucide-react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import instance from '../api/axiosInstant';

interface InputBoxProps {
  conversationId: string;
  settings: {
    customEmoji: string;
    notificationsEnabled: boolean;
    theme: string;
  };
  currentUser: { id: string } | null;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  isChoosingCustomEmoji: boolean;
  handleCustomEmojiClick: (emojiData: EmojiClickData) => void;
}

export default function InputBox({
  conversationId,
  settings,
  currentUser,
  showEmojiPicker,
  setShowEmojiPicker,
  isChoosingCustomEmoji,
  handleCustomEmojiClick,
}: InputBoxProps) {
  const dispatch = useAppDispatch();
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingMessage = useAppSelector(
    (state) => state.conversations.sendingMessage
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue =
        input.value.substring(0, start) + emoji + input.value.substring(end);

      setInputText(newValue);

      // đặt lại vị trí con trỏ ngay sau emoji
      const cursorPos = start + emoji.length;
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = cursorPos;
        input.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
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

  return (
    <div className="flex p-4 bg-white shadow-sm gap-2 items-center relative">
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

      <button
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="text-gray-600 hover:text-blue-600 transition-all duration-300"
      >
        <Smile size={18} />
      </button>

      <button
        onClick={handleSendLike}
        disabled={sendingMessage || !currentUser}
        className="text-2xl hover:bg-gray-100 rounded-lg p-1 disabled:opacity-50 transition-all duration-300"
      >
        {settings.customEmoji}
      </button>

      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-10">
          <EmojiPicker
            onEmojiClick={
              isChoosingCustomEmoji ? handleCustomEmojiClick : handleEmojiClick
            }
          />
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="text-sm text-gray-500 truncate max-w-xs">
          {selectedFiles.map((file) => file.name).join(', ')}
        </div>
      )}

      <input
        type="text"
        ref={inputRef}
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
  );
}
