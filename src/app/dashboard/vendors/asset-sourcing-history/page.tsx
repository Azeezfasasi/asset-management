'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Device { _id: string; deviceName: string; modelName: string; manufacturer: string; enrolledAt: string; status: string; }

export default function AssetSourcingPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/devices').then((r) => r.json()).then((d) => { setDevices(d.devices || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div className='space-y-6'>
      <PageHeader title='Asset Sourcing History' description='Track where assets were sourced and from which vendors.' backHref='/dashboard/vendors' />
      {loading ? <TableSkeleton /> : devices.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No assets yet</h3></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>Device</th><th className='px-4 py-3'>Model</th><th className='px-4 py-3'>Manufacturer</th><th className='px-4 py-3'>Enrolled</th><th className='px-4 py-3'>Status</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {devices.map((d) => (<tr key={d._id} className='hover:bg-slate-50'><td className='px-4 py-3 font-medium text-slate-900'>{d.deviceName}</td><td className='px-4 py-3 text-slate-600'>{d.modelName}</td><td className='px-4 py-3 text-slate-600'>{d.manufacturer}</td><td className='px-4 py-3 text-slate-500'>{new Date(d.enrolledAt).toLocaleDateString()}</td><td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${d.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{d.status}</span></td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}
