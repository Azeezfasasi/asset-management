import mongoose, { Document, Schema } from 'mongoose';

type DeviceStatus = 'In Store' | 'Active' | 'In-Repair' | 'Transferred' | 'Lost' | 'Damaged' | 'Archived';
type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Unknown';
type DeviceOS = 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux';

interface IAssignmentRecord {
  assignedTo: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  assignedAt: Date;
  unassignedAt?: Date;
  notes?: string;
}

interface IDevice extends Document {
  assetTag: string;
  imei: string;
  deviceName: string;
  modelName: string;
  manufacturer: string;
  os: DeviceOS;
  osVersion: string;
  status: DeviceStatus;
  category: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignmentHistory: IAssignmentRecord[];
  lastSeen?: Date;
  enrolledAt: Date;
  complianceStatus: ComplianceStatus;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  batteryLevel?: number;
  storageUsed?: number;
  storageTotal?: number;
  customFields?: Record<string, unknown>;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentRecordSchema = new Schema<IAssignmentRecord>({
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now },
  unassignedAt: { type: Date },
  notes: { type: String, trim: true },
}, { _id: true });

const DeviceSchema: Schema = new Schema({
  assetTag: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  imei: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  deviceName: {
    type: String,
    required: true,
    trim: true,
  },
  modelName: {
    type: String,
    required: true,
    trim: true,
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
  },
  os: {
    type: String,
    required: true,
    enum: ['Android', 'iOS', 'Windows', 'macOS', 'Linux'],
  },
  osVersion: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['In Store', 'Active', 'In-Repair', 'Transferred', 'Lost', 'Damaged', 'Archived'],
    default: 'In Store',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'AssetCategory',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignmentHistory: {
    type: [AssignmentRecordSchema],
    default: [],
  },
  lastSeen: {
    type: Date,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Unknown'],
    default: 'Unknown',
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
  },
  storageUsed: {
    type: Number,
  },
  storageTotal: {
    type: Number,
  },
  customFields: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for faster queries
DeviceSchema.index({ status: 1 });
DeviceSchema.index({ category: 1 });
DeviceSchema.index({ assignedTo: 1 });

export default mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

