import { Schema, model } from 'mongoose';

const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAvatar: {
      type: String,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
    },
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

export default model('Conversation', ConversationSchema);
