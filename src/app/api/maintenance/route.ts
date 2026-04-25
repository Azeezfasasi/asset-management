import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MaintenanceRecord from '@/models/MaintenanceRecord';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const device = searchParams.get('device');
    const upcoming = searchParams.get('upcoming');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (device) query.device = device;
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const records = await MaintenanceRecord.find(query)
      .populate('device', 'deviceName imei modelName status')
      .populate('vendor', 'name')
      .sort({ scheduledDate: 1 })
      .limit(100);

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Get maintenance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const {
      device,
      type,
      description,
      status,
      scheduledDate,
      completedDate,
      cost,
      technician,
      vendor,
      notes,
    } = await request.json();

    if (!device || !type || !description || !scheduledDate) {
      return NextResponse.json(
        { error: 'Device, type, description, and scheduledDate are required' },
        { status: 400 }
      );
    }

    const record = new MaintenanceRecord({
      device,
      type,
      description,
      status: status || 'Scheduled',
      scheduledDate: new Date(scheduledDate),
      completedDate: completedDate ? new Date(completedDate) : undefined,
      cost,
      technician,
      vendor,
      notes,
    });

    await record.save();
    await record.populate('device', 'deviceName imei modelName status');
    await record.populate('vendor', 'name');

    return NextResponse.json({
      message: 'Maintenance record created successfully',
      record,
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

