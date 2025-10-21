// repo/activityRepository.js
import Activity from "../models/Activity.js";
import Post from "../models/Post.js";

/**
 * Tạo activity mới (like hoặc comment)
 */
export const createActivity = async ({
  actor,
  post,
  postOwner,
  type,
  comment = null,
}) => {
  const activity = await Activity.create({
    actor,
    post,
    postOwner,
    type,
    comment,
  });
  return await Activity.populate(activity, [
    { path: "actor", select: "username avatar" },
    { path: "post", select: "content images" },
    { path: "postOwner", select: "username avatar" },
    {
      path: "comment",
      populate: { path: "author", select: "username avatar" },
    },
  ]);
};

/**
 * Lấy danh sách activity của một user (actor)
 */
export const findActivitiesByActor = async (actorId, limit = 20, skip = 0) => {
  return await Activity.find({ actor: actorId })
    .populate([
      {
        path: "post",
        select: "content images caption sharedFrom author",
        populate: [
          {
            path: "sharedFrom",
            select: "content images author",
            populate: { path: "author", select: "username avatar" },
          },
          {
            path: "author",
            select: "username avatar",
          },
        ],
      },
      { path: "postOwner", select: "username avatar" },
      {
        path: "comment",
        populate: { path: "author", select: "username avatar" },
      },
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Xoá activity (ví dụ bỏ like, xoá comment)
 */
export const deleteActivity = async (activityId) => {
  return await Activity.findByIdAndDelete(activityId);
};

/**
 * Kiểm tra một activity đã tồn tại chưa (vd: 1 user chỉ like 1 lần trên 1 post)
 */
export const findExistingActivity = async ({ actor, post, type }) => {
  return await Activity.findOne({ actor, post, type });
};
