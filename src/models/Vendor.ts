import mongoose, { Document, Schema } from 'mongoose';

type VendorStatus = 'Active' | 'Inactive' | 'Blacklisted';

export interface IVendor extends Document {
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  status: VendorStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Blacklisted'],
    default: 'Active',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

