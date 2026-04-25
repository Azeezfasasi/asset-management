'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Device { _id: string; imei: string; deviceName: string; modelName: string; manufacturer: string; os: string; osVersion: string; status: string; assignedTo?: { name: string; email: string }; complianceStatus: string; }

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Inactive: 'bg-amber-100 text-amber-800 border-amber-200',
  Lost: 'bg-red-100 text-red-800 border-red-200',
  Stolen: 'bg-red-100 text-red-800 border-red-200',
  Retired: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function ArchivedPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/devices').then((r) => r.json()).then((d) => { setDevices((d.devices || []).filter((x: Device) => x.status === 'Retired')); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const handleDelete = async () => { if (!deleteId) return; try { const res = await fetch(`/api/devices/${deleteId}`, { method: 'DELETE' }); if (res.ok) setDevices((p) => p.filter((d) => d._id !== deleteId)); } catch {} finally { setDeleteId(null); } };
  const filtered = devices.filter((d) => d.deviceName.toLowerCase().includes(filter.toLowerCase()) || d.imei.includes(filter) || d.modelName.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className='space-y-6'>
      <PageHeader title='Archived Devices' description='Devices that have been retired or archived.' backHref='/dashboard/devices' action={{ label: 'Add Device', href: '/dashboard/devices/add' }} />
      <div className='relative max-w-md'>
        <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg>
        <input type='text' placeholder='Search devices...' value={filter} onChange={(e) => setFilter(e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' />
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No devices found</h3><p className='mt-1 text-sm text-slate-500'>Devices with this status will appear here.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                <tr><th className='px-4 py-3'>Device</th><th className='px-4 py-3'>IMEI</th><th className='px-4 py-3'>OS</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'>Assigned</th><th className='px-4 py-3 text-right'>Actions</th></tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filtered.map((d) => (
                  <tr key={d._id} className='transition hover:bg-slate-50'>
                    <td className='px-4 py-3'><div className='font-medium text-slate-900'>{d.deviceName}</div><div className='text-xs text-slate-500'>{d.modelName} &middot; {d.manufacturer}</div></td>
                    <td className='px-4 py-3 font-mono text-xs text-slate-600'>{d.imei}</td>
                    <td className='px-4 py-3 text-slate-600'>{d.os} {d.osVersion}</td>
                    <td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[d.status] || 'bg-slate-100 text-slate-800'}`}>{d.status}</span></td>
                    <td className='px-4 py-3 text-slate-600'>{d.assignedTo?.name || 'Unassigned'}</td>
                    <td className='px-4 py-3 text-right'><button onClick={() => setDeleteId(d._id)} className='rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600' title='Delete'><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 6h18'/><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/></svg></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title='Delete Device' message='Are you sure? This cannot be undone.' confirmLabel='Delete' variant='danger' onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
