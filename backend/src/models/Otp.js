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

export default model('Otp', otpSchema);
