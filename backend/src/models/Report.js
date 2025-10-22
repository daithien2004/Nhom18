import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.reportType === 'user';
      },
    },
    reportedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: function () {
        return this.reportType === 'post';
      },
    },
    reportedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: function () {
        return this.reportType === 'comment';
      },
    },
    reportType: {
      type: String,
      enum: ['user', 'post', 'comment'],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'inappropriate_content',
        'harassment',
        'fake_information',
        'violence',
        'hate_speech',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
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

// Indexes for better query performance
reportSchema.index({ reporter: 1, reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.model('Report', reportSchema);
