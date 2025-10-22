import * as reportRepo from '../repositories/reportRepository.js';
import ApiError from '../utils/apiError.js';

export const createReport = async (reportData) => {
  const { reporter, reportType } = reportData;

  let targetId;
  if (reportType === 'user') targetId = reportData.reportedUser;
  else if (reportType === 'post') targetId = reportData.reportedPost;
  else if (reportType === 'comment') targetId = reportData.reportedComment;

  const existingReport = await reportRepo.checkExistingReport(
    reporter,
    reportType,
    targetId
  );
  if (existingReport) throw new ApiError(400, 'Bạn đã báo cáo mục này rồi');

  const report = await reportRepo.createReport(reportData);
  return await reportRepo.getReportById(report._id);
};

export const getReportById = async (reportId) => {
  const report = await reportRepo.getReportById(reportId);
  if (!report) throw new ApiError(404, 'Không tìm thấy báo cáo');
  return report;
};

export const getUserReports = async (userId, page = 1, limit = 10) => {
  return await reportRepo.getReports({ reporter: userId }, page, limit);
};

