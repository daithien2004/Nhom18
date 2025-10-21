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

    return activities.map((activity) => {
      const post = activity.post;
      const postOwner = activity.postOwner;
      const comment = activity.comment;

      // Nếu post là bài share
      const sharedFrom = post?.sharedFrom
        ? {
            id: post.sharedFrom.id?.toString(),
            content: post.sharedFrom.content,
            images: post.sharedFrom.images,
            author: post.sharedFrom.author
              ? {
                  id: post.sharedFrom.author.id?.toString(),
                  username: post.sharedFrom.author.username,
                  avatar: post.sharedFrom.author.avatar,
                }
              : null,
          }
        : null;

      return {
        id: activity.id.toString(),
        type: activity.type,
        createdAt: activity.createdAt,

        post: post
          ? {
              id: post.id.toString(),
              content: post.content,
              images: post.images,
              caption: post.caption,
              author: post.author
                ? {
                    id: post.author.id?.toString(),
                    username: post.author.username,
                    avatar: post.author.avatar,
                  }
                : null,
              sharedFrom, // thêm thông tin bài gốc nếu có
            }
          : null,

        postOwner: postOwner
          ? {
              id: postOwner.id.toString(),
              username: postOwner.username,
              avatar: postOwner.avatar,
            }
          : null,

        comment: comment
          ? {
              id: comment.id.toString(),
              content: comment.content,
              author: comment.author
                ? {
                    id: comment.author.id.toString(),
                    username: comment.author.username,
                    avatar: comment.author.avatar,
                  }
                : null,
            }
          : null,
      };
    });
  } catch (err) {
    console.error("Error in getActivities:", err);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Lỗi khi lấy danh sách activity"
    );
  }
};
