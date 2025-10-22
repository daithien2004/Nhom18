import React, { useState, useRef, useEffect } from 'react';
import { Ellipsis, Bookmark, Flag } from 'lucide-react';
import ReportModal from './ReportModal';
import type { ReportType, CreateReportRequest } from '../types/report';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';

interface PostMenuProps {
  onSave?: () => void;
  reportTarget?: { type: ReportType; id: string; name?: string };
  showSave?: boolean;
}

const PostMenu: React.FC<PostMenuProps> = ({ onSave, reportTarget, showSave = true }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openReport, setOpenReport] = useState(false);

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
            {showSave && (
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
            )}
            {reportTarget && (
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  setOpenReport(true);
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-red-600"
              >
                <Flag size={18} />
                <p>Báo cáo</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {openReport && reportTarget && (
        <ReportModal
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          reportType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
          onSubmit={async (data: CreateReportRequest) => {
            try {
              await reportService.createReport(data);
              toast.success('Đã gửi báo cáo');
            } catch (err) {
              toast.error('Gửi báo cáo thất bại');
            }
          }}
        />
      )}
    </div>
  );
};

export default PostMenu;
