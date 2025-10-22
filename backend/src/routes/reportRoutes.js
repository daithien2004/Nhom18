import express from 'express';
import { createReport, getReportById, getUserReports } from '../controllers/reportController.js';
import auth from '../middlewares/auth.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validation.js';
import reportSchemas from '../schemas/reportSchemas.js';

const router = express.Router();

// Tạo báo cáo mới (yêu cầu đăng nhập)
router.post(
  '/',
  auth,
  validateBody(reportSchemas.createReport),
  createReport
);

// Lấy báo cáo của người dùng hiện tại
router.get(
  '/my-reports',
  auth,
  validateQuery(reportSchemas.getReportsQuery),
  getUserReports
);

// Lấy báo cáo theo ID
router.get(
  '/:reportId',
  auth,
  validateParams(reportSchemas.reportParams),
  getReportById
);

export default router;
