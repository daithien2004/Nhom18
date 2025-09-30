import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true }, // người thực hiện
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true }, // bài post
    postOwner: { type: Schema.Types.ObjectId, ref: "User", required: true }, // chủ sở hữu bài post
    type: {
      type: String,
      enum: ["like", "comment"],
      required: true,
    },
    comment: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // nếu là comment thì lưu ref
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

export default model("Activity", activitySchema);
