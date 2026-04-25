import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vendor from '@/models/Vendor';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      (query as Record<string, unknown>)["$or"] = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, contactPerson, email, phone, address, website, status, notes } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const vendor = new Vendor({
      name,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      address,
      website,
      status: status || 'Active',
      notes,
    });

    await vendor.save();

    return NextResponse.json({
      message: 'Vendor created successfully',
      vendor,
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    const err = error as { code?: number };
    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'Vendor with this email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

