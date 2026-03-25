import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    entityType: { type: String, required: true }, // e.g. application, job, user
    entityId: { type: String, required: true },
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

auditLogSchema.index({ admin: 1, entityType: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

