import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  // Thông tin đăng nhập
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash lưu bằng bcrypt
  phone: { type: String, unique: true }, // nhiều app login bằng số điện thoại
  username: { type: String, required: true }, // tên hiển thị

  // Profile cá nhân
  avatar: { type: String, default: '' }, // link ảnh đại diện
  coverPhoto: { type: String, default: '' }, // ảnh bìa (nếu có)
  bio: { type: String, default: '' }, // mô tả ngắn
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  birthday: { type: Date },

  // Xác thực & trạng thái
  isVerified: { type: Boolean, default: false }, // đã verify OTP/email/phone chưa
  otp: { type: String }, // mã OTP tạm thời
  otpExpires: { type: Date },

  // Kết nối bạn bè
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }], // danh sách bạn bè
  friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }], // pending request

  // Online status
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },

  // Thông tin hệ thống
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// middleware update thời gian
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default model('User', userSchema);
