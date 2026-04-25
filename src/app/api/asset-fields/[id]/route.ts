import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AssetField from '@/models/AssetField';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const updateData = await request.json();

    const field = await AssetField.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!field) {
      return NextResponse.json(
        { error: 'Asset field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Asset field updated successfully',
      field,
    });
  } catch (error) {
    console.error('Update asset field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const field = await AssetField.findByIdAndDelete(id);
    if (!field) {
      return NextResponse.json(
        { error: 'Asset field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Asset field deleted successfully' });
  } catch (error) {
    console.error('Delete asset field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

