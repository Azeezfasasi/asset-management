import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetCategory extends Document {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  deviceCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssetCategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  icon: {
    type: String,
    default: 'box',
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  deviceCount: {
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

export default mongoose.models.AssetCategory || mongoose.model<IAssetCategory>('AssetCategory', AssetCategorySchema);

