export interface FriendUser {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface FriendRequest {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  status?: string;
}
