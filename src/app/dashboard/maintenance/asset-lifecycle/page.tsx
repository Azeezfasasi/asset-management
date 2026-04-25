'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Device { _id: string; deviceName: string; modelName: string; status: string; enrolledAt: string; lastSeen?: string; complianceStatus: string; }

export default function AssetLifecyclePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/devices').then((r) => r.json()).then((d) => { setDevices(d.devices || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  if (loading) return <div className='py-12'><TableSkeleton /></div>;
  return (
    <div className='space-y-6'>
      <PageHeader title='Asset Lifecycle' description='Track asset from acquisition to retirement.' backHref='/dashboard/maintenance' />
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>Device</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'>Enrolled</th><th className='px-4 py-3'>Last Seen</th><th className='px-4 py-3'>Compliance</th></tr></thead><tbody className='divide-y divide-slate-100'>
            {devices.map((d) => (<tr key={d._id} className='hover:bg-slate-50'><td className='px-4 py-3'><div className='font-medium text-slate-900'>{d.deviceName}</div><div className='text-xs text-slate-500'>{d.modelName}</div></td><td className='px-4 py-3 text-slate-600'>{d.status}</td><td className='px-4 py-3 text-slate-500'>{new Date(d.enrolledAt).toLocaleDateString()}</td><td className='px-4 py-3 text-slate-500'>{d.lastSeen ? new Date(d.lastSeen).toLocaleDateString() : '—'}</td><td className='px-4 py-3 text-slate-600'>{d.complianceStatus}</td></tr>))}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}
