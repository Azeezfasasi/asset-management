import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Device from '@/models/Device';
import AssetCategory from '@/models/AssetCategory';
import { generateAssetTag } from '@/lib/assetTag';
import { createAuditLog, createActivityLog } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';

// GET /api/devices - Get all devices
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const category = searchParams.get('category');

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (category) {
      query.category = category;
    }

    const devices = await Device.find(query)
      .populate('assignedTo', 'name email')
      .populate('category', 'name color')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
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

    const authUser = await verifyToken(request);

    const {
      imei,
      deviceName,
      modelName,
      manufacturer,
      os,
      osVersion,
      status,
      category,
      assignedTo,
      complianceStatus,
      location,
      batteryLevel,
      storageUsed,
      storageTotal,
      customFields,
    } = await request.json();

    if (!imei || !deviceName || !modelName || !manufacturer || !os || !osVersion || !category) {
      return NextResponse.json(
        { error: 'Required fields: imei, deviceName, modelName, manufacturer, os, osVersion, category' },
        { status: 400 }
      );
    }

    // Validate category exists
    const categoryDoc = await AssetCategory.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { error: 'Invalid category selected' },
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

    // Generate unique asset tag
    const assetTag = await generateAssetTag();

    // Build assignment history if assigned
    const assignmentHistory = [];
    if (assignedTo) {
      assignmentHistory.push({
        assignedTo,
        assignedBy: authUser?.id,
        assignedAt: new Date(),
        notes: 'Initial assignment on device creation',
      });
    }

    // Create device
    const device = new Device({
      assetTag,
      imei,
      deviceName,
      modelName,
      manufacturer,
      os,
      osVersion,
      status: status || 'In Store',
      category,
      assignedTo,
      assignmentHistory,
      complianceStatus: complianceStatus || 'Unknown',
      location,
      batteryLevel,
      storageUsed,
      storageTotal,
      customFields: customFields || {},
      createdBy: authUser?.id,
    });

    await device.save();

    // Update category device count
    await AssetCategory.findByIdAndUpdate(category, { $inc: { deviceCount: 1 } });

    // Populate for response
    await device.populate('assignedTo', 'name email');
    await device.populate('category', 'name color');

    // Audit logging
    if (authUser) {
      await createAuditLog({
        action: 'CREATE_DEVICE',
        entityType: 'Device',
        entityId: device._id.toString(),
        performedBy: authUser.id,
        performerName: authUser.name,
        performerRole: authUser.role,
        details: { assetTag, imei, deviceName, status: device.status },
      });
      await createActivityLog({
        user: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        action: 'CREATE_DEVICE',
        description: `Created device ${deviceName} (${assetTag})`,
        entityType: 'Device',
        entityId: device._id.toString(),
      });
    }

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

