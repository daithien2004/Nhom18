import type { ReportReason, ReportStatus, ReportType } from '../types/report';

export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: 'Spam',
  inappropriate_content: 'Nội dung không phù hợp',
  harassment: 'Quấy rối',
  fake_information: 'Thông tin giả',
  violence: 'Bạo lực',
  hate_speech: 'Ngôn từ thù địch',
  other: 'Khác',
};

export const REPORT_STATUSES: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  reviewing: 'Đang xem xét',
  resolved: 'Đã xử lý',
  dismissed: 'Đã bỏ qua',
};

export const REPORT_TYPES: Record<ReportType, string> = {
  user: 'Người dùng',
  post: 'Bài viết',
  comment: 'Bình luận',
};


