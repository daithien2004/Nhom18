import User from "../models/User.js";

// Lấy danh sách bạn bè theo userId
export const findFriends = async (userId) => {
  const user = await User.findById(userId)
    .populate("friends", "username avatar isOnline")
    .lean();
  return user?.friends || [];
};

// Tìm user theo id
export const findUserById = async (id) => {
  return await User.findById(id);
};

// Lưu thay đổi user
export const saveUser = async (user) => {
  return await user.save();
};

// Lấy ra danh sách đã gửi lời kết bạn
export const findUsersWithFriendRequestsFrom = async (currentUserId) => {
  return await User.find({ "friendRequests.from": currentUserId })
    .select("username avatar isOnline friendRequests")
    .lean();
};

// Lấy ra danh sách lời mời kết bạn đã nhận được
export const findUserWithReceivedFriendRequests = async (userId) => {
  return await User.findById(userId)
    .populate("friendRequests.from", "username avatar isOnline")
    .select("friendRequests");
};

// Lấy thông tin user (friends + friendRequests)
export const findFriendById = async (id) => {
  return User.findById(id).select("friends friendRequests").exec();
};

// Tìm tất cả user theo query, ngoại trừ chính userId
export const findAllUsersByQuery = async (userId, query) => {
  const regex = new RegExp(query, "i");

  return User.find({
    _id: { $ne: userId },
    $or: [{ username: regex }, { email: regex }, { phone: regex }],
  })
    .select("_id username avatar isOnline friendRequests")
    .exec();
};

// Tìm bạn bè theo query
export const findFriendsByQuery = async (friendIds, query) => {
  const regex = new RegExp(query, "i");

  return User.find({
    _id: { $in: friendIds },
    $or: [{ username: regex }, { phone: regex }],
  })
    .select("_id username avatar isOnline")
    .exec();
};
