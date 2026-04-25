'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface MR { _id: string; device: { deviceName: string; modelName: string }; type: string; description: string; status: string; scheduledDate: string; cost?: number; technician?: string; }

export default function MaintenancePage() {
  const [records, setRecords] = useState<MR[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => { fetch('/api/maintenance').then((r) => r.json()).then((d) => { setRecords(d.records || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const handleDelete = async () => { if (!deleteId) return; const res = await fetch(`/api/maintenance/${deleteId}`, { method: 'DELETE' }); if (res.ok) setRecords((p) => p.filter((r) => r._id !== deleteId)); setDeleteId(null); };
  return (
    <div className='space-y-6'>
      <PageHeader title='Maintenance / Repairs' description='Schedule and track maintenance activities.' />
      {loading ? <TableSkeleton /> : records.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No maintenance records</h3><p className='mt-1 text-sm text-slate-500'>Records will appear here.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>Device</th><th className='px-4 py-3'>Type</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'>Scheduled</th><th className='px-4 py-3'>Cost</th><th className='px-4 py-3 text-right'>Actions</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {records.map((r) => (<tr key={r._id} className='hover:bg-slate-50'><td className='px-4 py-3'><div className='font-medium text-slate-900'>{r.device?.deviceName || '—'}</div><div className='text-xs text-slate-500'>{r.device?.modelName}</div></td><td className='px-4 py-3 text-slate-600'>{r.type}</td><td className='px-4 py-3 text-slate-600'>{r.status}</td><td className='px-4 py-3 text-slate-500'>{new Date(r.scheduledDate).toLocaleDateString()}</td><td className='px-4 py-3 text-slate-600'>{r.cost != null ? `$${r.cost}` : '—'}</td><td className='px-4 py-3 text-right'><button onClick={() => setDeleteId(r._id)} className='rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600'><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 6h18'/><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/></svg></button></td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title='Delete Record' message='Are you sure?' confirmLabel='Delete' variant='danger' onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
