'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ReportsPage() {
  const [stats, setStats] = useState({ totalDevices: 0, totalUsers: 0, activeDevices: 0, compliantDevices: 0, maintenanceRecords: 0, totalVendors: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([fetch('/api/devices').then((r) => r.json()), fetch('/api/users').then((r) => r.json()), fetch('/api/maintenance').then((r) => r.json()), fetch('/api/vendors').then((r) => r.json())]).then(([d, u, m, v]) => {
      const devices = d.devices || []; const users = u.users || []; const maintenance = m.records || []; const vendors = v.vendors || [];
      setStats({ totalDevices: devices.length, totalUsers: users.length, activeDevices: devices.filter((x: { status: string }) => x.status === 'Active').length, compliantDevices: devices.filter((x: { complianceStatus: string }) => x.complianceStatus === 'Compliant').length, maintenanceRecords: maintenance.length, totalVendors: vendors.length });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  if (loading) return <div className='py-12'><CardSkeleton /></div>;
  const items = [
    { label: 'Total Devices', value: stats.totalDevices, accent: 'from-blue-600 to-cyan-500' },
    { label: 'Active Devices', value: stats.activeDevices, accent: 'from-emerald-600 to-lime-500' },
    { label: 'Compliant Devices', value: stats.compliantDevices, accent: 'from-fuchsia-600 to-violet-500' },
    { label: 'Total Users', value: stats.totalUsers, accent: 'from-amber-500 to-orange-500' },
    { label: 'Maintenance Records', value: stats.maintenanceRecords, accent: 'from-rose-500 to-pink-500' },
    { label: 'Total Vendors', value: stats.totalVendors, accent: 'from-sky-500 to-blue-500' },
  ];
  return (
    <div className='space-y-6'>
      <PageHeader title='Reports & Analytics' description='Comprehensive overview of your asset management data.' />
      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {items.map((item) => (
          <div key={item.label} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <div className={`h-12 w-12 rounded-2xl bg-linear-to-br ${item.accent}`} />
            <p className='mt-5 text-sm font-medium text-slate-500'>{item.label}</p>
            <p className='mt-2 text-4xl font-semibold tracking-tight text-slate-950'>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
