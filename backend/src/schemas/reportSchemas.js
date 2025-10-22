import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/u, 'ID không hợp lệ');

const reportTypeEnum = z.enum(['user', 'post', 'comment']);
const reportReasonEnum = z.enum([
  'spam',
  'inappropriate_content',
  'harassment',
  'fake_information',
  'violence',
  'hate_speech',
  'other'
]);
const reportStatusEnum = z.enum(['pending', 'reviewing', 'resolved', 'dismissed']);

// Body: create report
const createReport = z
  .object({
    reportType: reportTypeEnum,
    reason: reportReasonEnum,
    description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
    reportedUser: z.string().optional(),
    reportedPost: z.string().optional(),
    reportedComment: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.reportType === 'user' && !data.reportedUser) {
      ctx.addIssue({
        path: ['reportedUser'],
        code: z.ZodIssueCode.custom,
        message: 'ID người dùng được báo cáo là bắt buộc'
      });
    }
    if (data.reportType === 'post' && !data.reportedPost) {
      ctx.addIssue({
        path: ['reportedPost'],
        code: z.ZodIssueCode.custom,
        message: 'ID bài viết được báo cáo là bắt buộc'
      });
    }
    if (data.reportType === 'comment' && !data.reportedComment) {
      ctx.addIssue({
        path: ['reportedComment'],
        code: z.ZodIssueCode.custom,
        message: 'ID bình luận được báo cáo là bắt buộc'
      });
    }
  });

// Body: update status
const updateReportStatus = z.object({
  status: reportStatusEnum,
  adminNotes: z.string().max(1000, 'Ghi chú admin không được vượt quá 1000 ký tự').optional()
});

// Query: list/search
const getReportsQuery = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v == null || v === '' ? undefined : Number(v)))
    .pipe(z.number().int().min(1).optional()),
  limit: z
    .string()
    .optional()
    .transform((v) => (v == null || v === '' ? undefined : Number(v)))
    .pipe(z.number().int().min(1).max(100).optional()),
  status: reportStatusEnum.optional(),
  reportType: reportTypeEnum.optional(),
  search: z.string().max(100, 'Từ khóa tìm kiếm không được vượt quá 100 ký tự').optional()
});

// Params
const reportParams = z.object({ reportId: objectId });
const userParams = z.object({ userId: objectId });
const postParams = z.object({ postId: objectId });
const commentParams = z.object({ commentId: objectId });
const statusParams = z.object({ status: reportStatusEnum });
const typeParams = z.object({ reportType: reportTypeEnum });

const reportSchemas = {
  createReport,
  updateReportStatus,
  getReportsQuery,
  reportParams,
  userParams,
  postParams,
  commentParams,
  statusParams,
  typeParams
};

export default reportSchemas;
