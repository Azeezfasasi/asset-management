'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface AuditLog {
  _id: string; action: string; entityType: string; entityId?: string; performerName: string; createdAt: string;
}

export default function AssetHistoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  useEffect(() => {
    fetch('/api/audit-logs').then((r) => r.json()).then((d) => { setLogs(d.logs || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const filtered = logs.filter((l) => !filter || (l.entityId || '').includes(filter));
  return (
    <div className='space-y-6'>
      <PageHeader title='Asset History Tracking' description='Track changes and history of individual assets for accountability.' backHref='/dashboard/audit-logs' />
      <div className='relative max-w-md'>
        <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg>
        <input type='text' placeholder='Filter by entity ID...' value={filter} onChange={(e) => setFilter(e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' />
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No history found</h3><p className='mt-1 text-sm text-slate-500'>Asset changes will be logged here.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                <tr><th className='px-4 py-3'>Action</th><th className='px-4 py-3'>Entity</th><th className='px-4 py-3'>Entity ID</th><th className='px-4 py-3'>By</th><th className='px-4 py-3'>Time</th></tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filtered.map((l) => (
                  <tr key={l._id} className='transition hover:bg-slate-50'>
                    <td className='px-4 py-3 font-medium text-slate-900'>{l.action}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.entityType}</td>
                    <td className='px-4 py-3 font-mono text-xs text-slate-600'>{l.entityId || '—'}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.performerName}</td>
                    <td className='px-4 py-3 text-slate-500'>{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
