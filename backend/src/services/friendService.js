import ApiError from "../utils/apiError.js";
import * as friendRepo from "../repositories/friendRepository.js";
import * as conversationRepo from "../repositories/conversationRepository.js";
import { StatusCodes } from "http-status-codes";

// Lấy danh sách bạn bè
export const getFriends = async (userId) => {
  const user = await friendRepo.findUserById(userId);
  if (!user) throw new ApiError(404, "Không tìm thấy người dùng");
  return await friendRepo.findFriends(userId);
};

// Gửi lời mời kết bạn
export const sendFriendRequest = async (fromUserId, toUserId) => {
  if (fromUserId === toUserId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Không thể gửi lời mời cho chính mình"
    );
  }

  const toUser = await friendRepo.findUserById(toUserId);
  if (!toUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại");
  }

  // Đã là bạn bè
  if (toUser.friends.includes(fromUserId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Đã là bạn bè rồi");
  }

  // Đã gửi pending trước đó
  const alreadyRequested = toUser.friendRequests.some(
    (req) => req.from.toString() === fromUserId && req.status === "pending"
  );

  if (alreadyRequested) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Đã gửi lời mời trước đó");
  }

  // Push request (default = pending)
  toUser.friendRequests.push({ from: fromUserId });
  await friendRepo.saveUser(toUser);

  return { toUserId, status: "pending" };
};

// Lấy danh sách lời mời kết bạn đã gửi
export const getSentFriendRequests = async (currentUserId) => {
  const users = await friendRepo.findUsersWithFriendRequestsFrom(currentUserId);

  const sentRequests = [];
  users.forEach((u) => {
    u.friendRequests.forEach((fr) => {
      if (fr.from.toString() === currentUserId && fr.status === "pending") {
        sentRequests.push({
          to: {
            id: u.id,
            username: u.username,
            avatar: u.avatar,
            isOnline: u.isOnline,
          },
          status: fr.status,
        });
      }
    });
  });

  return sentRequests;
};

// Lấy danh sách lời mời kết bạn đã nhận được
export const getReceivedFriendRequests = async (currentUserId) => {
  const user = await friendRepo.findUserWithReceivedFriendRequests(
    currentUserId
  );

  return user.friendRequests
    .filter((fr) => fr.status === "pending")
    .map((fr) => ({
      from: {
        id: fr.from.id,
        username: fr.from.username,
        avatar: fr.from.avatar,
        isOnline: fr.from.isOnline,
      },
      status: fr.status,
    }));
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (currentUserId, fromUserId) => {
  const currentUser = await friendRepo.findUserById(currentUserId);
  const fromUser = await friendRepo.findUserById(fromUserId);

  if (!fromUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Người gửi không tồn tại");
  }

  // Tìm request pending
  const request = currentUser.friendRequests.find(
    (fr) => fr.from.toString() === fromUserId && fr.status === "pending"
  );

  if (!request) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Không tìm thấy lời mời kết bạn đang chờ xử lý"
    );
  }

  // Thêm vào danh sách bạn bè
  if (!currentUser.friends.includes(fromUserId)) {
    currentUser.friends.push(fromUserId);
  }
  if (!fromUser.friends.includes(currentUserId)) {
    fromUser.friends.push(currentUserId);
  }

  // Xóa request đã xử lý khỏi danh sách
  currentUser.friendRequests = currentUser.friendRequests.filter(
    (fr) => !(fr.from.toString() === fromUserId && fr.status === "pending")
  );

  await friendRepo.saveUser(currentUser);
  await friendRepo.saveUser(fromUser);
};

// Từ chối lời mời kết bạn
export const rejectFriendRequest = async (currentUserId, fromUserId) => {
  const currentUser = await friendRepo.findUserById(currentUserId);

  // Tìm request pending
  const request = currentUser.friendRequests.find(
    (fr) => fr.from.toString() === fromUserId && fr.status === "pending"
  );

  if (!request) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Không tìm thấy lời mời kết bạn đang chờ xử lý"
    );
  }

  // Xóa request đã xử lý
  currentUser.friendRequests = currentUser.friendRequests.filter(
    (fr) => !(fr.from.toString() === fromUserId && fr.status === "pending")
  );

  await friendRepo.saveUser(currentUser);
};

// Tìm kiếm toàn bộ người dùng
export const searchAllUsers = async (userId, query) => {
  const me = await friendRepo.findFriendById(userId);
  if (!me) throw new Error("Người dùng không tồn tại");
  const users = await friendRepo.findAllUsersByQuery(userId, query);
  return users.map((u) => {
    let status = "none";
    if (me.friends.includes(u.id)) status = "active";
    else if (
      me.friendRequests.some(
        (r) => r.from.equals(u.id) && r.status === "pending"
      )
    )
      status = "pending";
    return {
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      isOnline: u.isOnline,
      status,
    };
  });
};

// Tìm kiếm chỉ trong danh sách bạn bè
export const searchFriends = async (userId, query) => {
  const me = await friendRepo.findFriendById(userId);
  if (!me) throw new Error("Người dùng không tồn tại");

  const friends = await friendRepo.findFriendsByQuery(
    me.friends.map((f) => f.toString()),
    query
  );
  return friends.map((u) => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    isOnline: u.isOnline,
    status: "active",
  }));
};

export const cancelFriend = async (currentUserId, targetUserId) => {
  const currentUser = await friendRepo.findUserById(currentUserId);
  const targetUser = await friendRepo.findUserById(targetUserId);

  if (!targetUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng kia không tồn tại");
  }

  // Kiểm tra xem có đang là bạn bè không
  const isFriend = currentUser.friends.includes(targetUserId);
  if (!isFriend) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Hai người không phải bạn bè");
  }

  // Xóa bạn bè ở cả hai phía
  currentUser.friends = currentUser.friends.filter(
    (fr) => fr.toString() !== targetUserId
  );
  targetUser.friends = targetUser.friends.filter(
    (fr) => fr.toString() !== currentUserId
  );

  await friendRepo.saveUser(currentUser);
  await friendRepo.saveUser(targetUser);
};
