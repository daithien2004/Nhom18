export interface FriendUser {
  _id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface FriendRequest {
  _id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  status?: string;
}
