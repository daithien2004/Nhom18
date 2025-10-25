import React, { useState } from 'react';
import ReportModal from './ReportModal';
import type { CreateReportRequest } from '../types/report';
import { Flag } from 'lucide-react';

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
            <Flag size={18} />
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
