import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: {
      type: String,
      required: function () {
        return !this.sharedFrom;
      },
    },
    caption: { type: String }, // chú thích khi share
    images: [{ type: String }], // mảng URL ảnh
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    views: { type: Number, default: 0 }, // thống kê lượt xem
    shares: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    // thêm field để biết đây là post share
    sharedFrom: { type: Schema.Types.ObjectId, ref: "Post", default: null },
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

export default model("Post", postSchema);
