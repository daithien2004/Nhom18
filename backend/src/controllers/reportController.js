import * as reportService from '../services/reportService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createReport = asyncHandler(async (req, res) => {
  const { reportType, reason, description } = req.body;
  const reporter = req.user.id;

  const reportData = {
    reporter,
    reportType,
    reason,
    description,
    reportedUser: req.body.reportedUser,
    reportedPost: req.body.reportedPost,
    reportedComment: req.body.reportedComment,
  };

  const report = await reportService.createReport(reportData);
  return sendSuccess(res, report, 'Báo cáo đã được gửi thành công', 201);
});

export const getReportById = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const report = await reportService.getReportById(reportId);
  return sendSuccess(res, report);
});

export const getUserReports = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  const result = await reportService.getUserReports(userId, page, limit);
  return sendSuccess(res, result, 'Lấy danh sách báo cáo thành công');
});

