import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AssetField from '@/models/AssetField';

export async function GET() {
  try {
    await connectToDatabase();

    const fields = await AssetField.find({})
      .sort({ order: 1 })
      .limit(50);

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('Get asset fields error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, label, type, required, defaultValue, options, order } = await request.json();

    if (!name || !label) {
      return NextResponse.json(
        { error: 'Name and label are required' },
        { status: 400 }
      );
    }

    const field = new AssetField({
      name: name.toLowerCase().trim().replace(/\s+/g, '_'),
      label,
      type: type || 'text',
      required: required || false,
      defaultValue,
      options,
      order: order || 0,
    });

    await field.save();

    return NextResponse.json({
      message: 'Asset field created successfully',
      field,
    });
  } catch (error) {
    console.error('Create asset field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

