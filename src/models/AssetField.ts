import mongoose, { Document, Schema } from 'mongoose';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea';

export interface IAssetField extends Document {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssetFieldSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea'],
    default: 'text',
  },
  required: {
    type: Boolean,
    default: false,
  },
  defaultValue: {
    type: String,
    trim: true,
  },
  options: [{
    type: String,
    trim: true,
  }],
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.AssetField || mongoose.model<IAssetField>('AssetField', AssetFieldSchema);

