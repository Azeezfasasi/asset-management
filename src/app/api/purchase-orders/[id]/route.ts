import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await PurchaseOrder.findById(id).populate('vendor', 'name email');
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    if (body.items?.length) {
      body.items = body.items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      body.totalAmount = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    }

    const order = await PurchaseOrder.findByIdAndUpdate(id, body, { new: true, runValidators: true }).populate('vendor', 'name email');
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Purchase order updated', order });
  } catch (error) {
    console.error('Update PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await PurchaseOrder.findByIdAndDelete(id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Purchase order deleted' });
  } catch (error) {
    console.error('Delete PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

