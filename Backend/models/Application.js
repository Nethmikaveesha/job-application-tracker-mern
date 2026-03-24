import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '', maxlength: 2000 },
    resumePath: { type: String, default: '' },
    coverLetterPath: { type: String, default: '' },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ status: 1, appliedAt: -1 });

export default mongoose.model('Application', applicationSchema);
