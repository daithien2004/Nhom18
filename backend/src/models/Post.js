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
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }],
    views: { type: Number, default: 0 }, // thống kê lượt xem
    shares: [{ type: Schema.Types.ObjectId, ref: "Post", default: [] }],
    sharedFrom: { type: Schema.Types.ObjectId, ref: "Post", default: null },

    // Thêm 2 trường mới
    isHidden: { type: Boolean, default: false }, // mặc định không ẩn
    isDeleted: { type: Boolean, default: false }, // mặc định chưa xóa
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

export default model("Post", postSchema);
