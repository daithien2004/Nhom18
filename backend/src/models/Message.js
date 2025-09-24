import { Schema, model } from 'mongoose';

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String, // link ảnh / file
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
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
  } // tự động có createdAt, updatedAt
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export default model('Message', MessageSchema);
