'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface AuditLog {
  _id: string; action: string; entityType: string; performerName: string; performerRole: string; createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/audit-logs').then((r) => r.json()).then((d) => { setLogs(d.logs || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return (
    <div className='space-y-6'>
      <PageHeader title='Audit & Logs' description='View system activity and audit logs for compliance.' />
      {loading ? <TableSkeleton /> : logs.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No audit logs</h3><p className='mt-1 text-sm text-slate-500'>System actions will be logged here.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                <tr><th className='px-4 py-3'>Action</th><th className='px-4 py-3'>Entity</th><th className='px-4 py-3'>By</th><th className='px-4 py-3'>Role</th><th className='px-4 py-3'>Time</th></tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {logs.map((l) => (
                  <tr key={l._id} className='transition hover:bg-slate-50'>
                    <td className='px-4 py-3 font-medium text-slate-900'>{l.action}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.entityType}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.performerName}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.performerRole}</td>
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
