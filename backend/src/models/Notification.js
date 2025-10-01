import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    senderId: {
      // người thực hiện hành động (like, comment...)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      // người nhận thông báo
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false, // mặc định là chưa đọc
    },
    type: {
      type: String,
      enum: [
        'like',
        'comment',
        'follow',
        'share',
        'system',
        'tag',
        'mention',
        'reaction',
        'friend_request',
        'friend_accept',
        'security',
      ],
      required: true,
    },
    metadata: {
      type: Object, // để lưu thêm dữ liệu động (ví dụ: postId, commentId...)
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret._id) {
          // Kiểm tra _id tồn tại
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        if (ret._id) {
          // Kiểm tra _id tồn tại
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  } // tự động có createdAt, updatedAt
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
