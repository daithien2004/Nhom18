import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchIncomingRequests,
  fetchOutgoingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../store/slices/friendSlice';
import { UserPlus } from 'lucide-react';

export default function FriendRequests() {
  const dispatch = useAppDispatch();
  const {
    incomingRequests,
    outgoingRequests,
    isLoadingIncoming,
    isLoadingOutgoing,
    isError,
  } = useAppSelector((state) => state.friends);

  useEffect(() => {
    dispatch(fetchIncomingRequests());
    dispatch(fetchOutgoingRequests());
  }, [dispatch]);

  const handleAccept = (id: string) => dispatch(acceptFriendRequest(id));
  const handleReject = (id: string) => dispatch(rejectFriendRequest(id));

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-4">
        Lỗi khi tải dữ liệu, thử lại sau
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <UserPlus size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Lời mời kết bạn
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Incoming */}
        <div>
          <h3 className="text-gray-500 font-semibold mb-3">Lời mời nhận</h3>
          {isLoadingIncoming ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : incomingRequests.length === 0 ? (
            <p className="text-gray-500">Không có lời mời nhận</p>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={u.avatar || '/default-avatar.png'}
                        alt={u.username}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          u.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-gray-800 truncate">
                        {u.username}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {u.status === 'pending' ? 'Đang chờ' : u.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(u.id)}
                      className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-600 transition cursor-pointer"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm hover:bg-gray-300 transition cursor-pointer"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing */}
        <div>
          <h3 className="text-gray-500 font-semibold mb-3">Lời mời đã gửi</h3>
          {isLoadingOutgoing ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : outgoingRequests.length === 0 ? (
            <p className="text-gray-500">Không có lời mời đã gửi</p>
          ) : (
            <div className="space-y-3">
              {outgoingRequests.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={u.avatar || '/default-avatar.png'}
                        alt={u.username}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          u.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-gray-800 truncate">
                        {u.username}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {u.status === 'pending' ? 'Đang chờ' : u.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
