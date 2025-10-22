import Report from '../models/Report.js';

export const createReport = async (reportData) => {
  const report = new Report(reportData);
  return await report.save();
};

export const getReports = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query = Report.find(filters)
    .populate('reporter', 'username email avatar')
    .populate('reportedUser', 'username email avatar')
    .populate('reportedPost', 'title content author')
    .populate('reportedComment', 'content author')
    .populate('resolvedBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const reports = await query.exec();
  const total = await Report.countDocuments(filters);

  return {
    reports,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

export const getReportById = async (reportId) => {
  return await Report.findById(reportId)
    .populate('reporter', 'username email avatar')
    .populate('reportedUser', 'username email avatar')
    .populate('reportedPost', 'title content author')
    .populate('reportedComment', 'content author')
    .populate('resolvedBy', 'username email');
};

export const checkExistingReport = async (reporterId, reportType, targetId) => {
  const query = {
    reporter: reporterId,
    reportType: reportType,
  };

  if (reportType === 'user') {
    query.reportedUser = targetId;
  } else if (reportType === 'post') {
    query.reportedPost = targetId;
  } else if (reportType === 'comment') {
    query.reportedComment = targetId;
  }

  return await Report.findOne(query);
};

