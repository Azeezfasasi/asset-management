'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function StockAnalyticsPage() {
  const [devices, setDevices] = useState<{ _id: string; status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/devices').then((r) => r.json()).then((d) => { setDevices(d.devices || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  if (loading) return <div className="py-12"><CardSkeleton /></div>;
  const byMonth: Record<string, number> = {};
  devices.forEach((d) => { const m = new Date(d.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' }); byMonth[m] = (byMonth[m] || 0) + 1; });
  const months = Object.keys(byMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const maxVal = Math.max(...Object.values(byMonth), 1);
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Analytics" description="View stock performance and trends." backHref="/dashboard/devices" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Acquisition Timeline</h3>
          <div className="mt-4 space-y-3">
            {months.map((m) => (
              <div key={m}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">{m}</span>
                  <span className="font-medium text-slate-900">{byMonth[m]}</span>
                </div>
                <div className="mt-1 h-2.5 w-full rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${(byMonth[m] / maxVal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Stock Summary</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total Devices</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{devices.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Active</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{devices.filter((d) => d.status === 'Active').length}</p>
            </div>
        </div>
        </div>
    </div>
    </div>
  );
}
