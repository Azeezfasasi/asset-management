import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Device from '@/models/Device';

// GET /api/devices - Get all devices
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const query: Record<string, string> = {};

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const devices = await Device.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/devices - Create new device
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const {
      imei,
      deviceName,
      modelName,
      manufacturer,
      os,
      osVersion,
      status,
      assignedTo,
      complianceStatus,
      location,
      batteryLevel,
      storageUsed,
      storageTotal,
    } = await request.json();

    if (!imei || !deviceName || !modelName || !manufacturer || !os || !osVersion) {
      return NextResponse.json(
        { error: 'Required fields: imei, deviceName, modelName, manufacturer, os, osVersion' },
        { status: 400 }
      );
    }

    // Check if device already exists
    const existingDevice = await Device.findOne({ imei });
    if (existingDevice) {
      return NextResponse.json(
        { error: 'Device with this IMEI already exists' },
        { status: 400 }
      );
    }

    // Create device
    const device = new Device({
      imei,
      deviceName,
      modelName,
      manufacturer,
      os,
      osVersion,
      status: status || 'Active',
      assignedTo,
      complianceStatus: complianceStatus || 'Unknown',
      location,
      batteryLevel,
      storageUsed,
      storageTotal,
    });

    await device.save();

    // Populate assigned user
    await device.populate('assignedTo', 'name email');

    return NextResponse.json({
      message: 'Device created successfully',
      device,
    });
  } catch (error) {
    console.error('Create device error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}