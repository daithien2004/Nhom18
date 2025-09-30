// controllers/activityController.js
import * as activityService from "../services/activityService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// ⭐️ [NEW] Lấy danh sách activity của user hiện tại
export const getActivities = asyncHandler(async (req, res) => {
  const activities = await activityService.getActivities({
    userId: req.user.id,
    limit: req.query.limit,
    page: req.query.page,
  });

  return sendSuccess(res, activities, "Lấy danh sách activity thành công");
});
