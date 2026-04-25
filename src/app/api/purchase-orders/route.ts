import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';

// GET /api/purchase-orders
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendor = searchParams.get('vendor');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query).populate('vendor', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      PurchaseOrder.countDocuments(query),
    ]);

    return NextResponse.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/purchase-orders
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.poNumber || !body.vendor || !body.items?.length) {
      return NextResponse.json({ error: 'PO number, vendor, and items are required' }, { status: 400 });
    }

    // Auto-calculate totals
    const items = body.items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const totalAmount = items.reduce((sum: number, item: { total: number }) => sum + item.total, 0);

    const order = new PurchaseOrder({ ...body, items, totalAmount });
    await order.save();
    await order.populate('vendor', 'name email');

    return NextResponse.json({ message: 'Purchase order created', order }, { status: 201 });
  } catch (error) {
    console.error('Create purchase order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

