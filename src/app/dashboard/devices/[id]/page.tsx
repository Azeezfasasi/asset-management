'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { FormSkeleton } from '@/components/ui/LoadingSkeleton';

interface Device {
  _id: string; imei: string; deviceName: string; modelName: string; manufacturer: string; os: string; osVersion: string; status: string; assignedTo?: { _id: string; name: string; email: string }; complianceStatus: string; location?: { latitude: number; longitude: number }; batteryLevel?: number; storageUsed?: number; storageTotal?: number; enrolledAt: string;
}

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    async function fetchDevice() {
      try { const { id } = await params; const res = await fetch(`/api/devices/${id}`); const data = await res.json(); if (res.ok) { setDevice(data.device); } else { setError(data.error || 'Device not found'); } } catch { setError('Failed to load device'); } finally { setLoading(false); }
    }
    fetchDevice();
  }, [params]);
  if (loading) return <div className='py-12'><FormSkeleton /></div>;
  if (error) return <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'>{error}</div>;
  if (!device) return null;
  return (
    <div className='space-y-6'>
      <PageHeader title={device.deviceName} description={`${device.modelName} by ${device.manufacturer}`} backHref='/dashboard/devices' />
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-500'>Device Info</h3>
          <dl className='mt-4 space-y-3 text-sm'>
            <div className='flex justify-between'><dt className='text-slate-500'>IMEI</dt><dd className='font-mono text-slate-900'>{device.imei}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Operating System</dt><dd className='text-slate-900'>{device.os} {device.osVersion}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Status</dt><dd className='text-slate-900'>{device.status}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Compliance</dt><dd className='text-slate-900'>{device.complianceStatus}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Enrolled</dt><dd className='text-slate-900'>{new Date(device.enrolledAt).toLocaleDateString()}</dd></div>
          </dl>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-500'>Assignment</h3>
          <dl className='mt-4 space-y-3 text-sm'>
            <div className='flex justify-between'><dt className='text-slate-500'>Assigned To</dt><dd className='text-slate-900'>{device.assignedTo?.name || 'Unassigned'}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Email</dt><dd className='text-slate-900'>{device.assignedTo?.email || '—'}</dd></div>
          </dl>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-500'>Health</h3>
          <dl className='mt-4 space-y-3 text-sm'>
            <div className='flex justify-between'><dt className='text-slate-500'>Battery</dt><dd className='text-slate-900'>{device.batteryLevel != null ? `${device.batteryLevel}%` : '—'}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Storage Used</dt><dd className='text-slate-900'>{device.storageUsed != null ? `${device.storageUsed} MB` : '—'}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Storage Total</dt><dd className='text-slate-900'>{device.storageTotal != null ? `${device.storageTotal} MB` : '—'}</dd></div>
          </dl>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-500'>Location</h3>
          <dl className='mt-4 space-y-3 text-sm'>
            <div className='flex justify-between'><dt className='text-slate-500'>Latitude</dt><dd className='text-slate-900'>{device.location?.latitude ?? '—'}</dd></div>
            <div className='flex justify-between'><dt className='text-slate-500'>Longitude</dt><dd className='text-slate-900'>{device.location?.longitude ?? '—'}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
