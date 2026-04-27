import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Device from '@/models/Device';
import AssetCategory from '@/models/AssetCategory';
import { generateAssetTag } from '@/lib/assetTag';
import { createAuditLog, createActivityLog } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const authUser = await verifyToken(request);

    const { devices: deviceList } = await request.json();

    if (!Array.isArray(deviceList) || deviceList.length === 0) {
      return NextResponse.json(
        { error: 'Devices array is required' },
        { status: 400 }
      );
    }

    if (deviceList.length > 500) {
      return NextResponse.json(
        { error: 'Maximum 500 devices per bulk upload' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as unknown[],
      failed: [] as { index: number; error: string; data: unknown }[],
    };

    // Pre-validate IMEIs for duplicates within batch
    const imeis = deviceList.map((d) => d.imei).filter(Boolean);
    const duplicateImeis = imeis.filter((item, index) => imeis.indexOf(item) !== index);
    if (duplicateImeis.length > 0) {
      return NextResponse.json(
        { error: `Duplicate IMEIs found in upload: ${[...new Set(duplicateImeis)].join(', ')}` },
        { status: 400 }
      );
    }

    // Check existing IMEIs in DB
    const existingDevices = await Device.find({ imei: { $in: imeis } }, { imei: 1 });
    const existingImeiSet = new Set(existingDevices.map((d) => d.imei));

    for (let i = 0; i < deviceList.length; i++) {
      const data = deviceList[i];
      try {
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
        } = data;

        if (!imei || !deviceName || !modelName || !manufacturer || !os || !osVersion || !category) {
          results.failed.push({
            index: i,
            error: 'Missing required fields',
            data,
          });
          continue;
        }

        if (existingImeiSet.has(imei)) {
          results.failed.push({
            index: i,
            error: 'Device with this IMEI already exists',
            data,
          });
          continue;
        }

        const categoryDoc = await AssetCategory.findById(category);
        if (!categoryDoc) {
          results.failed.push({
            index: i,
            error: 'Invalid category',
            data,
          });
          continue;
        }

        const assetTag = await generateAssetTag();
        const assignmentHistory = [];
        if (assignedTo) {
          assignmentHistory.push({
            assignedTo,
            assignedBy: authUser?.id,
            assignedAt: new Date(),
            notes: 'Initial assignment on bulk creation',
          });
        }

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
        await AssetCategory.findByIdAndUpdate(category, { $inc: { deviceCount: 1 } });
        existingImeiSet.add(imei);

        results.success.push({
          index: i,
          assetTag,
          _id: device._id,
          deviceName,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.failed.push({ index: i, error: message, data });
      }
    }

    // Audit log for bulk upload
    if (authUser && results.success.length > 0) {
      await createAuditLog({
        action: 'BULK_CREATE_DEVICE',
        entityType: 'Device',
        performedBy: authUser.id,
        performerName: authUser.name,
        performerRole: authUser.role,
        details: { count: results.success.length, failedCount: results.failed.length },
      });
      await createActivityLog({
        user: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        action: 'BULK_CREATE_DEVICE',
        description: `Bulk uploaded ${results.success.length} devices (${results.failed.length} failed)`,
        entityType: 'Device',
      });
    }

    return NextResponse.json({
      message: `Bulk upload complete: ${results.success.length} created, ${results.failed.length} failed`,
      results,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

