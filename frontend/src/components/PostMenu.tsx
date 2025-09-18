import React, { useState, useRef, useEffect } from 'react';
import {
  Ellipsis,
  PlusCircle,
  MinusCircle,
  Bookmark,
  Bell,
  Code,
} from 'lucide-react';

interface PostMenuProps {
  onInterested?: () => void;
  onNotInterested?: () => void;
  onSave?: () => void;
  onNotify?: () => void;
  onEmbed?: () => void;
}

const PostMenu: React.FC<PostMenuProps> = ({
  onInterested,
  onNotInterested,
  onSave,
  onNotify,
  onEmbed,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // click ngoài thì đóng menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // ✨ chặn event lan ra ngoài
          setOpen((prev) => !prev);
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Ellipsis className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <ul className="p-2 text-sm text-gray-700">
            <li
              onClick={onInterested}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <PlusCircle size={18} />
              <div>
                <p className="font-medium">Quan tâm</p>
                <p className="text-xs text-gray-500">
                  Bạn sẽ nhìn thấy nhiều bài viết tương tự hơn.
                </p>
              </div>
            </li>
            <li
              onClick={onNotInterested}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <MinusCircle size={18} />
              <div>
                <p className="font-medium">Không quan tâm</p>
                <p className="text-xs text-gray-500">
                  Bạn sẽ nhìn thấy ít bài viết tương tự hơn.
                </p>
              </div>
            </li>
            <li
              onClick={(e) => {
                e.stopPropagation();
                onSave?.();
                setOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Bookmark size={18} />
              <p>Lưu bài viết</p>
            </li>

            <li
              onClick={(e) => {
                e.stopPropagation();
                onInterested?.();
                setOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <PlusCircle size={18} />
              <div>
                <p className="font-medium">Quan tâm</p>
                <p className="text-xs text-gray-500">
                  Bạn sẽ nhìn thấy nhiều bài viết tương tự hơn.
                </p>
              </div>
            </li>
            <li
              onClick={onNotify}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Bell size={18} />
              <p>Bật thông báo về bài viết này</p>
            </li>
            <li
              onClick={onEmbed}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Code size={18} />
              <p>Nhúng</p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PostMenu;
