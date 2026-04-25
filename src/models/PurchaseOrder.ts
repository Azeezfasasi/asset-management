import mongoose, { Document, Schema } from 'mongoose';

type POStatus = 'Draft' | 'Sent' | 'Acknowledged' | 'Partial' | 'Received' | 'Cancelled';

interface POItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  vendor: mongoose.Types.ObjectId;
  items: POItem[];
  totalAmount: number;
  status: POStatus;
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const POItemSchema = new Schema<POItem>({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
}, { _id: false });

const PurchaseOrderSchema: Schema = new Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [POItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Acknowledged', 'Partial', 'Received', 'Cancelled'],
    default: 'Draft',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

