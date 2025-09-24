import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    // Người sở hữu danh mục
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Tên danh mục (VD: Để xem sau, Công việc, Học tập...)
    name: { type: String, required: true },

    // Danh sách bài viết được lưu trong danh mục này
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],

    // Nếu là danh mục mặc định (VD: "Để xem sau")
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Chuyển _id thành id
        delete ret._id; // Xóa trường _id
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Chuyển _id thành id
        delete ret._id; // Xóa trường _id
        return ret;
      },
    },
  } // tự động có createdAt, updatedAt
);

export default model('Category', categorySchema);
