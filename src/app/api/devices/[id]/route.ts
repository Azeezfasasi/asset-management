import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Device from '@/models/Device';
import AssetCategory from '@/models/AssetCategory';
import { createAuditLog, createActivityLog } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';

// GET /api/devices/[id] - Get device by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const device = await Device.findById(id)
      .populate('assignedTo', 'name email')
      .populate('category', 'name color')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignmentHistory.assignedTo', 'name email')
      .populate('assignmentHistory.assignedBy', 'name email');

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Get device error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/devices/[id] - Update device
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const authUser = await verifyToken(request);
    const { id } = await params;

    const existingDevice = await Device.findById(id);
    if (!existingDevice) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const updateData = await request.json();

    // Remove undefined values but keep explicit nulls for unassignment
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle assignment changes for history tracking
    const oldAssignedTo = existingDevice.assignedTo?.toString();
    const newAssignedTo = updateData.assignedTo;

    if (newAssignedTo !== undefined && oldAssignedTo !== newAssignedTo) {
      // Unassign old user if exists
      if (oldAssignedTo) {
        const lastAssignment = existingDevice.assignmentHistory?.[existingDevice.assignmentHistory.length - 1];
        if (lastAssignment && !lastAssignment.unassignedAt) {
          lastAssignment.unassignedAt = new Date();
        }
      }

      // Assign new user if provided
      if (newAssignedTo) {
        updateData.$push = {
          assignmentHistory: {
            assignedTo: newAssignedTo,
            assignedBy: authUser?.id,
            assignedAt: new Date(),
            notes: updateData.assignmentNotes || 'Reassigned via edit',
          },
        };
      }

      delete updateData.assignmentNotes;
    }

    // Handle category change - update device counts
    const oldCategory = existingDevice.category?.toString();
    const newCategory = updateData.category;
    if (newCategory && oldCategory !== newCategory) {
      await AssetCategory.findByIdAndUpdate(oldCategory, { $inc: { deviceCount: -1 } });
      await AssetCategory.findByIdAndUpdate(newCategory, { $inc: { deviceCount: 1 } });
    }

    // Track updater
    if (authUser) {
      updateData.updatedBy = authUser.id;
    }

    const device = await Device.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('category', 'name color')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignmentHistory.assignedTo', 'name email')
      .populate('assignmentHistory.assignedBy', 'name email');

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Audit logging
    if (authUser) {
      await createAuditLog({
        action: 'UPDATE_DEVICE',
        entityType: 'Device',
        entityId: device._id.toString(),
        performedBy: authUser.id,
        performerName: authUser.name,
        performerRole: authUser.role,
        details: {
          assetTag: device.assetTag,
          changes: Object.keys(updateData).filter((k) => !k.startsWith('$')),
          oldAssignedTo,
          newAssignedTo,
        },
      });
      await createActivityLog({
        user: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        action: 'UPDATE_DEVICE',
        description: `Updated device ${device.deviceName} (${device.assetTag})`,
        entityType: 'Device',
        entityId: device._id.toString(),
      });
    }

    return NextResponse.json({
      message: 'Device updated successfully',
      device,
    });
  } catch (error) {
    console.error('Update device error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/devices/[id] - Delete device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const authUser = await verifyToken(request);
    const { id } = await params;

    const device = await Device.findById(id);
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Decrement category count
    if (device.category) {
      await AssetCategory.findByIdAndUpdate(device.category, { $inc: { deviceCount: -1 } });
    }

    await Device.findByIdAndDelete(id);

    // Audit logging
    if (authUser) {
      await createAuditLog({
        action: 'DELETE_DEVICE',
        entityType: 'Device',
        entityId: id,
        performedBy: authUser.id,
        performerName: authUser.name,
        performerRole: authUser.role,
        details: { assetTag: device.assetTag, imei: device.imei, deviceName: device.deviceName },
      });
      await createActivityLog({
        user: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        action: 'DELETE_DEVICE',
        description: `Deleted device ${device.deviceName} (${device.assetTag})`,
        entityType: 'Device',
        entityId: id,
      });
    }

    return NextResponse.json({
      message: 'Device deleted successfully',
    });
  } catch (error) {
    console.error('Delete device error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

