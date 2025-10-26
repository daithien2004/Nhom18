import React, { useState, useRef, useEffect } from 'react';
import { Ellipsis, Bookmark, Flag, Edit, Trash2 } from 'lucide-react';
import ReportModal from './ReportModal';
import type { ReportType, CreateReportRequest } from '../types/report';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';

interface PostMenuProps {
  onSave?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  reportTarget?: { type: ReportType; id: string; name?: string };
  showSave?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  isOwner?: boolean;
}

const PostMenu: React.FC<PostMenuProps> = ({
  onSave,
  onEdit,
  onDelete,
  reportTarget,
  showSave = true,
  showEdit = false,
  showDelete = false,
  isOwner = false,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openReport, setOpenReport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const getDeleteConfirmText = () => {
    if (reportTarget?.type === 'comment') {
      return {
        title: 'Xác nhận xóa bình luận',
        message:
          'Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.',
        button: 'Xóa bình luận',
      };
    }
    return {
      title: 'Xác nhận xóa bài viết',
      message:
        'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      button: 'Xóa bài viết',
    };
  };

  const confirmText = getDeleteConfirmText();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Ellipsis className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <ul className="p-2 text-sm text-gray-700">
            {/* Edit & Delete cho chủ sở hữu */}
            {isOwner && showEdit && (
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                  setOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <Edit size={18} />
                <p>
                  Chỉnh sửa{' '}
                  {reportTarget?.type === 'comment' ? 'bình luận' : 'bài viết'}
                </p>
              </li>
            )}

            {isOwner && showDelete && (
              <li
                onClick={handleDeleteClick}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-red-600"
              >
                <Trash2 size={18} />
                <p>
                  Xóa{' '}
                  {reportTarget?.type === 'comment' ? 'bình luận' : 'bài viết'}
                </p>
              </li>
            )}

            {/* Phân cách */}
            {isOwner &&
              (showEdit || showDelete) &&
              (showSave || reportTarget) && (
                <div className="my-2 border-t border-gray-200" />
              )}

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

            {reportTarget && !isOwner && (
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

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmText.title}
            </h3>
            <p className="text-gray-600 mb-6">{confirmText.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                {confirmText.button}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal - giả định bạn sẽ implement */}
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
