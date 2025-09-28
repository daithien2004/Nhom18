import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id && ret._id.toString ? ret._id.toString() : ret.id; // an toàn
        delete ret._id; // Xóa trường _id
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id && ret._id.toString ? ret._id.toString() : ret.id; // an toàn
        delete ret._id; // Xóa trường _id
        return ret;
      },
    },
  } // tự động có createdAt, updatedAt
);

export default model("Comment", commentSchema);
