import { Schema, model } from "mongoose";

const postCategorySchema = new Schema(
  {
    // Người sở hữu danh mục
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Tên danh mục (VD: Để xem sau, Công việc, Học tập...)
    name: { type: String, required: true },

    // Danh sách bài viết được lưu trong danh mục này
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    // Nếu là danh mục mặc định (VD: "Để xem sau")
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("PostCategory", postCategorySchema);
