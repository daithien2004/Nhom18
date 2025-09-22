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
  { timestamps: true }
);

export default model('Conversation', ConversationSchema);
