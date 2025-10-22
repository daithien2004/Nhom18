import React, { useState } from 'react';
import ReportModal from './ReportModal';
import type { CreateReportRequest } from '../types/report';

interface ReportButtonProps {
  reportType: 'user' | 'post' | 'comment';
  targetId: string;
  targetName?: string;
  onReport: (data: CreateReportRequest) => Promise<void>;
  className?: string;
  children?: React.ReactNode;
}

const ReportButton: React.FC<ReportButtonProps> = ({
  reportType,
  targetId,
  targetName,
  onReport,
  className = '',
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = async (data: CreateReportRequest) => {
    try {
      await onReport(data);
      // Có thể thêm toast notification ở đây
    } catch (error) {
      console.error('Error reporting:', error);
      // Có thể thêm error handling ở đây
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors ${className}`}
        title={`Báo cáo ${
          reportType === 'user'
            ? 'người dùng'
            : reportType === 'post'
            ? 'bài viết'
            : 'bình luận'
        }`}
      >
        {children || (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Báo cáo
          </>
        )}
      </button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReport}
        reportType={reportType}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  );
};

export default ReportButton;
