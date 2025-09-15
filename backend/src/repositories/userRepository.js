import User from "../models/User.js";

// ================== Basic ==================
export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findById = async (id) => {
  return await User.findById(id);
};

export const findByIdWithoutPassword = async (id) => {
  return await User.findById(id).select("-password -otp -otpExpires");
};

export const updateById = async (id, updates) => {
  return await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
};

export const updateByIdSelect = async (id, updates, selectFields) => {
  return await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).select(selectFields);
};

export const createUser = async ({ username, email, password, phone }) => {
  return await User.create({ username, email, password, phone });
};

// ================== Social features ==================

// Lấy danh sách bạn bè
export const findFriends = async (userId) => {
  const user = await User.findById(userId)
    .populate("friends", "username avatar isOnline")
    .lean();
  return user?.friends || [];
};

// Lấy danh sách lời mời kết bạn
export const findFriendRequests = async (userId) => {
  const user = await User.findById(userId)
    .populate("friendRequests", "username avatar isOnline")
    .lean();
  return user?.friendRequests || [];
};

// Tìm kiếm người dùng theo keyword
export const searchUsers = async (keyword, userId) => {
  return await User.find({
    $and: [
      {
        $or: [
          { username: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } }, // thêm tìm theo phone
        ],
      },
      { _id: { $ne: userId } },
    ],
  }).select("username avatar isOnline");
};

// ================== Friend request ==================

// Kiểm tra user tồn tại
export const existsById = async (id) => {
  return await User.exists({ _id: id });
};

// Thêm lời mời kết bạn
export const addFriendRequest = async (toUserId, fromUserId) => {
  const toUser = await User.findById(toUserId);
  toUser.friendRequests.push(fromUserId);
  return await toUser.save();
};

// Chấp nhận lời mời kết bạn
export const acceptFriend = async (userId, fromUserId) => {
  const user = await User.findById(userId);
  const fromUser = await User.findById(fromUserId);

  user.friends.push(fromUserId);
  fromUser.friends.push(userId);

  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== fromUserId
  );

  await user.save();
  await fromUser.save();
};

// Từ chối lời mời kết bạn
export const rejectFriend = async (userId, fromUserId) => {
  const user = await User.findById(userId);
  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== fromUserId
  );
  await user.save();
};
