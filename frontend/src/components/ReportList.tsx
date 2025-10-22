import React from 'react';
import { type Report } from '../types/report';
import { REPORT_STATUSES, REPORT_TYPES, REPORT_REASONS } from '../constants/report';

interface ReportListProps {
  reports: Report[];
  onStatusUpdate?: (
    reportId: string,
    status: string,
    adminNotes?: string
  ) => void;
  onDelete?: (reportId: string) => void;
  showActions?: boolean;
}

const ReportList: React.FC<ReportListProps> = ({
  reports,
  onStatusUpdate,
  onDelete,
  showActions = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-purple-100 text-purple-800';
      case 'post':
        return 'bg-blue-100 text-blue-800';
      case 'comment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có báo cáo nào
        </div>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    report.status
                  )}`}
                >
                  {REPORT_STATUSES[report.status]}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    report.reportType
                  )}`}
                >
                  {REPORT_TYPES[report.reportType]}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(report.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Người báo cáo:
                </span>
                <span className="text-sm text-gray-600">
                  {report.reporter.username}
                </span>
              </div>

              {report.reportedUser && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Người dùng được báo cáo:
                  </span>
                  <span className="text-sm text-gray-600">
                    {report.reportedUser.username}
                  </span>
                </div>
              )}

              {report.reportedPost && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Bài viết:
                  </span>
                  <span className="text-sm text-gray-600">
                    {report.reportedPost.title}
                  </span>
                </div>
              )}

              {report.reportedComment && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Bình luận:
                  </span>
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {report.reportedComment.content}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Lý do:
                </span>
                <span className="text-sm text-gray-600">
                  {REPORT_REASONS[report.reason]}
                </span>
              </div>

              {report.description && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700">
                    Mô tả:
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.description}
                  </p>
                </div>
              )}
            </div>

            {report.adminNotes && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Ghi chú admin:
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {report.adminNotes}
                </p>
              </div>
            )}

            {report.resolvedBy && (
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Xử lý bởi:
                  </span>
                  <span className="text-sm text-gray-600">
                    {report.resolvedBy.username}
                  </span>
                  {report.resolvedAt && (
                    <span className="text-sm text-gray-500">
                      ({new Date(report.resolvedAt).toLocaleDateString('vi-VN')}
                      )
                    </span>
                  )}
                </div>
              </div>
            )}

            {showActions && onStatusUpdate && (
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onStatusUpdate(report.id, 'reviewing')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  disabled={
                    report.status === 'resolved' ||
                    report.status === 'dismissed'
                  }
                >
                  Xem xét
                </button>
                <button
                  onClick={() => onStatusUpdate(report.id, 'resolved')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  disabled={
                    report.status === 'resolved' ||
                    report.status === 'dismissed'
                  }
                >
                  Giải quyết
                </button>
                <button
                  onClick={() => onStatusUpdate(report.id, 'dismissed')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  disabled={
                    report.status === 'resolved' ||
                    report.status === 'dismissed'
                  }
                >
                  Bỏ qua
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(report.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Xóa
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReportList;
