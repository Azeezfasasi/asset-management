'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Category { name: string; color: string; }
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
  category?: Category;
  assignedTo?: { name: string; email: string };
  complianceStatus: string;
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

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    fetch('/api/devices?status=In-Repair')
      .then((r) => r.json())
      .then((d) => { if (mounted) { setDevices(d.devices || []); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/devices/${deleteId}`, { method: 'DELETE' });
      if (res.ok) setDevices((p) => p.filter((d) => d._id !== deleteId));
    } catch (e) { console.error(e); } finally { setDeleteId(null); }
  };

  const filtered = devices.filter((d) => {
    const matchesSearch = d.deviceName.toLowerCase().includes(filter.toLowerCase()) ||
      d.imei.includes(filter) ||
      d.modelName.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch;
  });

  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices In Repair"
        description="Assets currently undergoing maintenance or repair."
        action={{ label: 'Add Device', href: '/dashboard/devices/add' }}
      />

      <div className="relative max-w-md">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search devices by name, IMEI, or model..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        </div>

      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No devices found</h3>
          <p className="mt-1 text-sm text-slate-500">Add a device to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Asset Tag</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">IMEI</th>
                  <th className="px-4 py-3">OS</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Compliance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d._id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{d.assetTag}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{d.deviceName}</div>
                      <div className="text-xs text-slate-500">{d.modelName} &middot; {d.manufacturer}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.imei}</td>
                    <td className="px-4 py-3 text-slate-600">{d.os} {d.osVersion}</td>
                    <td className="px-4 py-3">
                      {d.category ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: d.category.color }} />
                          <span className="text-slate-600">{d.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[d.status] || 'bg-slate-100 text-slate-800'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.assignedTo?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-600">{d.complianceStatus}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/devices/${d._id}`} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600" title="View">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </Link>
                        <Link href={`/dashboard/devices/${d._id}/edit`} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </Link>
                        <button onClick={() => setDeleteId(d._id)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Device"
        message="Are you sure? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

