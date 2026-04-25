import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Device from '@/models/Device';
import User from '@/models/User';
import Vendor from '@/models/Vendor';
import PurchaseOrder from '@/models/PurchaseOrder';
import MaintenanceRecord from '@/models/MaintenanceRecord';

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalDevices,
      activeDevices,
      inactiveDevices,
      unassignedDevices,
      inStoreDevices,
      archivedDevices,
      lostDevices,
      stolenDevices,
      totalUsers,
      compliantDevices,
      nonCompliantDevices,
      unknownComplianceDevices,
      totalVendors,
      totalMaintenance,
      upcomingMaintenance,
      totalPurchaseOrders,
      receivedOrders,
      pendingOrders,
    ] = await Promise.all([
      Device.countDocuments(),
      Device.countDocuments({ status: 'Active' }),
      Device.countDocuments({ status: 'Inactive' }),
      Device.countDocuments({ assignedTo: { $exists: false } }),
      Device.countDocuments({ status: 'Inactive' }),
      Device.countDocuments({ status: 'Retired' }),
      Device.countDocuments({ status: 'Lost' }),
      Device.countDocuments({ status: 'Stolen' }),
      User.countDocuments(),
      Device.countDocuments({ complianceStatus: 'Compliant' }),
      Device.countDocuments({ complianceStatus: 'Non-Compliant' }),
      Device.countDocuments({ complianceStatus: 'Unknown' }),
      Vendor.countDocuments(),
      MaintenanceRecord.countDocuments(),
      MaintenanceRecord.countDocuments({ status: 'Scheduled', scheduledDate: { $gte: new Date() } }),
      PurchaseOrder.countDocuments(),
      PurchaseOrder.countDocuments({ status: 'Received' }),
      PurchaseOrder.countDocuments({ status: { $in: ['Draft', 'Sent', 'Acknowledged', 'Partial'] } }),
    ]);

    return NextResponse.json({
      totalDevices,
      activeDevices,
      inactiveDevices,
      unassignedDevices,
      inStoreDevices,
      archivedDevices,
      lostDevices,
      stolenDevices,
      totalUsers,
      compliantDevices,
      nonCompliantDevices,
      unknownComplianceDevices,
      totalVendors,
      totalMaintenance,
      upcomingMaintenance,
      totalPurchaseOrders,
      receivedOrders,
      pendingOrders,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

