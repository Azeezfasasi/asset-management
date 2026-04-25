'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { FormSkeleton } from '@/components/ui/LoadingSkeleton';

interface User { _id: string; name: string; email: string; }

export default function AddDevicePage() {
  const [formData, setFormData] = useState({ imei: '', deviceName: '', modelName: '', manufacturer: '', os: 'Android', osVersion: '', status: 'Active', assignedTo: '', complianceStatus: 'Unknown', batteryLevel: '', storageUsed: '', storageTotal: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const fetchUsers = useCallback(async () => { try { const r = await fetch('/api/users'); const d = await r.json(); setUsers(d.users || []); } catch {} finally { setPageLoading(false); } }, []);
  useEffect(() => { fetchUsers(); }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = { ...formData, assignedTo: formData.assignedTo || undefined, batteryLevel: formData.batteryLevel ? parseInt(formData.batteryLevel) : undefined, storageUsed: formData.storageUsed ? parseInt(formData.storageUsed) : undefined, storageTotal: formData.storageTotal ? parseInt(formData.storageTotal) : undefined };
      const res = await fetch('/api/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (res.ok) { router.push('/dashboard/devices'); } else { setError(json.error || 'Failed to add device'); }
    } catch { setError('Network error. Please try again.'); } finally { setLoading(false); }
  };
  if (pageLoading) return <div className='py-12'><FormSkeleton /></div>;
  return (
    <div className='space-y-6'>
      <PageHeader title='Register Asset' description='Capture a new device and assign it to the right owner or policy group.' backHref='/dashboard/devices' />
      {error && <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'>{error}</div>}
      <form onSubmit={handleSubmit} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {[{ id: 'imei', label: 'IMEI *', type: 'text', required: true }, { id: 'deviceName', label: 'Device Name *', type: 'text', required: true }, { id: 'modelName', label: 'Model *', type: 'text', required: true }, { id: 'manufacturer', label: 'Manufacturer *', type: 'text', required: true }, { id: 'osVersion', label: 'OS Version *', type: 'text', required: true }, { id: 'batteryLevel', label: 'Battery Level (%)', type: 'number' }, { id: 'storageUsed', label: 'Storage Used (MB)', type: 'number' }, { id: 'storageTotal', label: 'Storage Total (MB)', type: 'number' }].map((f) => (
            <div key={f.id}><label htmlFor={f.id} className='block text-sm font-medium text-slate-700'>{f.label}</label><input type={f.type} id={f.id} name={f.id} value={(formData as Record<string,string>)[f.id]} onChange={handleChange} required={f.required} min={f.type === 'number' ? '0' : undefined} max={f.id === 'batteryLevel' ? '100' : undefined} className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          ))}
          <div><label htmlFor='os' className='block text-sm font-medium text-slate-700'>Operating System *</label><select id='os' name='os' value={formData.os} onChange={handleChange} required className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm'><option>Android</option><option>iOS</option><option>Windows</option><option>macOS</option><option>Linux</option></select></div>
          <div><label htmlFor='status' className='block text-sm font-medium text-slate-700'>Status</label><select id='status' name='status' value={formData.status} onChange={handleChange} className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm'><option>Active</option><option>Inactive</option><option>Lost</option><option>Stolen</option><option>Retired</option></select></div>
          <div><label htmlFor='assignedTo' className='block text-sm font-medium text-slate-700'>Assigned To</label><select id='assignedTo' name='assignedTo' value={formData.assignedTo} onChange={handleChange} className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm'><option value=''>Unassigned</option>{users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}</select></div>
          <div><label htmlFor='complianceStatus' className='block text-sm font-medium text-slate-700'>Compliance Status</label><select id='complianceStatus' name='complianceStatus' value={formData.complianceStatus} onChange={handleChange} className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm'><option>Compliant</option><option>Non-Compliant</option><option>Unknown</option></select></div>
        </div>
        <div className='flex justify-end gap-3'><button type='button' onClick={() => router.push('/dashboard/devices')} className='rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'>Cancel</button><button type='submit' disabled={loading} className='rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50'>{loading ? 'Adding...' : 'Add Device'}</button></div>
      </form>
    </div>
  );
}
