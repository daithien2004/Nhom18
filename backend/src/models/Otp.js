import { Schema, model } from 'mongoose';

const otpSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
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
  }
);

export default model('Otp', otpSchema);
