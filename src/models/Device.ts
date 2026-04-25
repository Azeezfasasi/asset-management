import mongoose, { Document, Schema } from 'mongoose';

type DeviceStatus = 'Active' | 'Inactive' | 'Lost' | 'Stolen' | 'Retired';
type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Unknown';
type DeviceOS = 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux';

interface IDevice extends Document {
  imei: string;
  deviceName: string;
  modelName: string; // renamed from 'model' to avoid conflict with Document methods
  manufacturer: string;
  os: DeviceOS;
  osVersion: string;
  status: DeviceStatus;
  assignedTo?: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema: Schema = new Schema({
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
    enum: ['Active', 'Inactive', 'Lost', 'Stolen', 'Retired'],
    default: 'Active',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
    type: Number, // in MB
  },
  storageTotal: {
    type: Number, // in MB
  },
}, {
  timestamps: true,
});

export default mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);