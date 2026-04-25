import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  entityType: string;
  entityId?: string;
  performedBy: mongoose.Types.ObjectId;
  performerName: string;
  performerRole: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  entityType: {
    type: String,
    required: true,
    trim: true,
  },
  entityId: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  performerName: {
    type: String,
    required: true,
  },
  performerRole: {
    type: String,
    required: true,
  },
  details: {
    type: Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for fast querying
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityType: 1, action: 1 });
AuditLogSchema.index({ performedBy: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

