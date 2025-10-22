export interface Report {
  id: string;
  reporter: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  reportedUser?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  reportedPost?: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      username: string;
    };
  };
  reportedComment?: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
    };
  };
  reportType: ReportType;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedBy?: {
    id: string;
    username: string;
    email: string;
  };
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportReason = 
  | 'spam'
  | 'inappropriate_content'
  | 'harassment'
  | 'fake_information'
  | 'violence'
  | 'hate_speech'
  | 'other';

export type ReportStatus = 
  | 'pending'
  | 'reviewing'
  | 'resolved'
  | 'dismissed';

export interface CreateReportRequest {
  reportType: ReportType;
  reason: ReportReason;
  description?: string;
  reportedUser?: string;
  reportedPost?: string;
  reportedComment?: string;
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  reportType?: ReportType;
  search?: string;
}

export interface ReportPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ReportResponse {
  success: boolean;
  data: Report;
  message?: string;
}

export interface ReportListResponse {
  success: boolean;
  data: Report[];
  pagination: ReportPagination;
}

export type ReportType = 'user' | 'post' | 'comment';
