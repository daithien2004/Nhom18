import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true } // thêm createdAt và updatedAt
);

export default model('Comment', commentSchema);
