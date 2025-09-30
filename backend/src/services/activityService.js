// services/activityService.js
import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import * as activityRepo from "../repositories/activityRepository.js";

/**
 * Lấy danh sách activity của user hiện tại
 */
export const getActivities = async ({ userId, limit, page = 1 }) => {
  const l = limit ? parseInt(limit) : 20;
  const p = page ? parseInt(page) : 1;
  const skip = (p - 1) * l;

  try {
    const activities = await activityRepo.findActivitiesByActor(
      userId,
      l,
      skip
    );

    return activities.map((activity) => ({
      id: activity.id.toString(),
      type: activity.type,
      createdAt: activity.createdAt,
      post: activity.post
        ? {
            id: activity.post.id.toString(),
            content: activity.post.content,
            images: activity.post.images,
          }
        : null,
      postOwner: activity.postOwner
        ? {
            id: activity.postOwner.id.toString(),
            username: activity.postOwner.username,
            avatar: activity.postOwner.avatar,
          }
        : null,
      comment: activity.comment
        ? {
            id: activity.comment.id.toString(),
            content: activity.comment.content,
            author: activity.comment.author
              ? {
                  id: activity.comment.author.id.toString(),
                  username: activity.comment.author.username,
                  avatar: activity.comment.author.avatar,
                }
              : null,
          }
        : null,
    }));
  } catch (err) {
    console.error("Error in getActivities:", err);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy danh sách activity"
    );
  }
};
