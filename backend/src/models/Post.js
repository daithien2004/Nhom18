import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    images: [{ type: String }], // mảng URL ảnh
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    views: { type: Number, default: 0 }, // thêm để thống kê lượt xem
    isPinned: { type: Boolean, default: false }, // đánh dấu "đáng chú ý"
  },
  { timestamps: true } // tự động có createdAt và updatedAt
);

export default model('Post', postSchema);
