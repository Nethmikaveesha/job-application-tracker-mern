import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    description: { type: String, default: '', maxlength: 8000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

jobSchema.index({ company: 1, title: 1 });
jobSchema.index({ location: 1, employmentType: 1 });

export default mongoose.model('Job', jobSchema);
