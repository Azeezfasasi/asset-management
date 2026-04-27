'use client';

import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { FormSkeleton } from '@/components/ui/LoadingSkeleton';

interface AssignmentRecord {
  _id: string;
  assignedTo: { _id: string; name: string; email: string } | null;
  assignedBy: { _id: string; name: string } | null;
  assignedAt: string;
  unassignedAt?: string;
  notes?: string;
}

interface AuditLog {
  _id: string;
  action: string;
  entityId?: string;
  performedBy: { name: string; role: string } | null;
  createdAt: string;
  details?: Record<string, unknown>;
}

interface MaintenanceRecord {
  _id: string;
  type: string;
  description: string;
  status: string;
  scheduledDate: string;
  cost?: number;
  technician?: string;
}

interface Device {
  _id: string;
  assetTag: string;
  imei: string;
  deviceName: string;
  modelName: string;
  manufacturer: string;
  os: string;
  osVersion: string;
  status: string;
  category?: { _id: string; name: string; color: string };
  assignedTo?: { _id: string; name: string; email: string };
  assignmentHistory: AssignmentRecord[];
  complianceStatus: string;
  location?: { latitude: number; longitude: number; address?: string };
  batteryLevel?: number;
  storageUsed?: number;
  storageTotal?: number;
  enrolledAt: string;
  createdBy?: { name: string; email: string };
  updatedBy?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, unknown>;
}

const statusColors: Record<string, string> = {
  'In Store': 'bg-blue-100 text-blue-800 border-blue-200',
  'Active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'In-Repair': 'bg-amber-100 text-amber-800 border-amber-200',
  'Transferred': 'bg-purple-100 text-purple-800 border-purple-200',
  'Lost': 'bg-red-100 text-red-800 border-red-200',
  'Damaged': 'bg-orange-100 text-orange-800 border-orange-200',
  'Archived': 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'maintenance'>('overview');

  useEffect(() => {
    let mounted = true;
    async function fetchDevice() {
      try {
        const { id } = await params;
        const res = await fetch(`/api/devices/${id}`);
        const data = await res.json();
        if (res.ok) {
          if (mounted) setDevice(data.device);
          // Fetch audit logs for this device
          const auditRes = await fetch(`/api/audit-logs?entityType=Device&limit=50`);
          const auditData = await auditRes.json();
          if (mounted) setAuditLogs((auditData.logs || []).filter((l: AuditLog) => l.details?.assetTag === data.device?.assetTag || l.entityId === id));
          // Fetch maintenance records
          const maintRes = await fetch(`/api/maintenance?device=${id}`);
          const maintData = await maintRes.json();
          if (mounted) setMaintenanceRecords(maintData.records || []);
        } else {
          if (mounted) setError(data.error || 'Device not found');
        }
      } catch {
        if (mounted) setError('Failed to load device');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDevice();
    return () => { mounted = false; };
  }, [params]);

  if (loading) return <div className="py-12"><FormSkeleton /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>;
  if (!device) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={device.deviceName}
        description={`${device.modelName} by ${device.manufacturer} | Asset Tag: ${device.assetTag}`}
        backHref="/dashboard/devices"
        action={{ label: 'Edit Device', href: `/dashboard/devices/${device._id}/edit` }}
      />

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusColors[device.status] || 'bg-slate-100 text-slate-800'}`}>
          {device.status}
        </span>
        <span className="text-xs text-slate-500">
          Last updated: {new Date(device.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['overview', 'history', 'maintenance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'history' ? 'Assignment & Audit History' : 'Maintenance Records'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Device Info</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Asset Tag</dt><dd className="font-mono font-medium text-slate-900">{device.assetTag}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">IMEI</dt><dd className="font-mono text-slate-900">{device.imei}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Operating System</dt><dd className="text-slate-900">{device.os} {device.osVersion}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="text-slate-900">{device.status}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Compliance</dt><dd className="text-slate-900">{device.complianceStatus}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="text-slate-900">{device.category?.name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Enrolled</dt><dd className="text-slate-900">{new Date(device.enrolledAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Assignment</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Assigned To</dt><dd className="text-slate-900">{device.assignedTo?.name || 'Unassigned'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="text-slate-900">{device.assignedTo?.email || '—'}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Health</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Battery</dt><dd className="text-slate-900">{device.batteryLevel != null ? `${device.batteryLevel}%` : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Storage Used</dt><dd className="text-slate-900">{device.storageUsed != null ? `${device.storageUsed} MB` : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Storage Total</dt><dd className="text-slate-900">{device.storageTotal != null ? `${device.storageTotal} MB` : '—'}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Location</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Latitude</dt><dd className="text-slate-900">{device.location?.latitude ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Longitude</dt><dd className="text-slate-900">{device.location?.longitude ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Address</dt><dd className="text-slate-900">{device.location?.address || '—'}</dd></div>
            </dl>
          </div>
          {(device.createdBy || device.updatedBy) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Audit Trail</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {device.createdBy && (
                  <div className="flex justify-between"><dt className="text-slate-500">Created By</dt><dd className="text-slate-900">{device.createdBy.name} ({device.createdBy.email}) on {new Date(device.createdAt).toLocaleString()}</dd></div>
                )}
                {device.updatedBy && (
                  <div className="flex justify-between"><dt className="text-slate-500">Last Updated By</dt><dd className="text-slate-900">{device.updatedBy.name} ({device.updatedBy.email}) on {new Date(device.updatedAt).toLocaleString()}</dd></div>
                )}
              </dl>
            </div>
          )}
          {device.customFields && Object.keys(device.customFields).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Custom Fields</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {Object.entries(device.customFields).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                    <dd className="text-slate-900">{Array.isArray(value) ? value.join(', ') : String(value || '—')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Assignment History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Assignment History</h3>
            {device.assignmentHistory?.length === 0 ? (
              <p className="text-sm text-slate-500">No assignment history recorded.</p>
            ) : (
              <div className="space-y-3">
                {[...(device.assignmentHistory || [])].reverse().map((record) => (
                  <div key={record._id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        Assigned to <span className="font-medium">{record.assignedTo?.name || 'Unknown'}</span>
                        {record.assignedBy && <span className="text-slate-500"> by {record.assignedBy.name}</span>}
                      </p>
                      {record.notes && <p className="text-xs text-slate-500 mt-0.5">{record.notes}</p>}
                      <div className="flex gap-4 mt-1 text-xs text-slate-400">
                        <span>From: {new Date(record.assignedAt).toLocaleString()}</span>
                        {record.unassignedAt && <span>To: {new Date(record.unassignedAt).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Log History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Change History</h3>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No audit records found for this device.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">By</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Time</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
                        <td className="px-4 py-3 text-slate-600">{log.performedBy?.name || 'System'}</td>
                        <td className="px-4 py-3 text-slate-600">{log.performedBy?.role || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Maintenance Records</h3>
            <Link
              href="/dashboard/maintenance"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Manage Maintenance
            </Link>
          </div>
          {maintenanceRecords.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">No maintenance records</h3>
              <p className="mt-1 text-sm text-slate-500">Maintenance records for this device will appear here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Scheduled</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Technician</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {maintenanceRecords.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{r.type}</td>
                        <td className="px-4 py-3 text-slate-600">{r.description}</td>
                        <td className="px-4 py-3 text-slate-600">{r.status}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(r.scheduledDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-slate-600">{r.cost != null ? `$${r.cost}` : '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{r.technician || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

