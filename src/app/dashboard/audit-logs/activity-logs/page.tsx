'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface ActivityLog {
  _id: string; userName: string; userRole: string; action: string; description: string; createdAt: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/activity-logs').then((r) => r.json()).then((d) => { setLogs(d.logs || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return (
    <div className='space-y-6'>
      <PageHeader title='Activity Logs' description='View user activity and system events for auditing.' backHref='/dashboard/audit-logs' />
      {loading ? <TableSkeleton /> : logs.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No activity logs</h3><p className='mt-1 text-sm text-slate-500'>User actions will be logged here.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                <tr><th className='px-4 py-3'>User</th><th className='px-4 py-3'>Role</th><th className='px-4 py-3'>Action</th><th className='px-4 py-3'>Description</th><th className='px-4 py-3'>Time</th></tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {logs.map((l) => (
                  <tr key={l._id} className='transition hover:bg-slate-50'>
                    <td className='px-4 py-3 font-medium text-slate-900'>{l.userName}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.userRole}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.action}</td>
                    <td className='px-4 py-3 text-slate-600'>{l.description}</td>
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
