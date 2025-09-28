import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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

export default model('Comment', commentSchema);
