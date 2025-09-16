import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    // Login
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true },
    username: { type: String, required: true },

    // Profile
    avatar: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    birthday: { type: Date },

    // Verification
    isVerified: { type: Boolean, default: false },

    // Friends
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [
      {
        from: { type: Types.ObjectId, ref: "User", required: true },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],

    // Online status
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true } // tự động có createdAt, updatedAt
);

export default model("User", userSchema);
