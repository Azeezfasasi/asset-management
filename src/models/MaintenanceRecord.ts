import mongoose, { Document, Schema } from 'mongoose';

type MaintenanceType = 'Repair' | 'Upgrade' | 'Inspection' | 'Calibration' | 'Cleaning' | 'Other';
type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';

export interface IMaintenanceRecord extends Document {
  device: mongoose.Types.ObjectId;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: Date;
  completedDate?: Date;
  cost?: number;
  technician?: string;
  vendor?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema: Schema = new Schema({
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  type: {
    type: String,
    enum: ['Repair', 'Upgrade', 'Inspection', 'Calibration', 'Cleaning', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'],
    default: 'Scheduled',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  completedDate: {
    type: Date,
  },
  cost: {
    type: Number,
    min: 0,
  },
  technician: {
    type: String,
    trim: true,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.MaintenanceRecord || mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);

