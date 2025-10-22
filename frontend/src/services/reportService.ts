import apiClient from '../api/axiosInstant';
import type {
  CreateReportRequest,
  ReportFilters,
  ReportResponse,
  ReportListResponse,
} from '../types/report';

export const reportService = {
  // Tạo báo cáo mới
  createReport: async (data: CreateReportRequest): Promise<ReportResponse> => {
    const response = await apiClient.post('/reports', data);
    return response.data;
  },

  // Lấy báo cáo của người dùng hiện tại
  getMyReports: async (
    filters: ReportFilters = {}
  ): Promise<ReportListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.reportType) params.append('reportType', filters.reportType);

    const response = await apiClient.get(
      `/reports/my-reports?${params.toString()}`
    );
    return response.data;
  },

  // Lấy báo cáo theo ID
  getReportById: async (reportId: string): Promise<ReportResponse> => {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  },
};
