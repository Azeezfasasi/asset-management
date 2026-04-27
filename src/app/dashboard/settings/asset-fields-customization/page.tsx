'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Field {
  _id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  isActive: boolean;
}

export default function AssetFieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', label: '', type: 'text', required: false });
  useEffect(() => { fetch('/api/asset-fields').then((r) => r.json()).then((d) => { setFields(d.fields || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const res = await fetch('/api/asset-fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (res.ok) { setForm({ name: '', label: '', type: 'text', required: false }); fetch('/api/asset-fields').then((r) => r.json()).then((d) => setFields(d.fields || [])); }
  };
  const toggleActive = async (id: string, current: boolean) => { const res = await fetch(`/api/asset-fields/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) }); if (res.ok) setFields((p) => p.map((f) => f._id === id ? { ...f, isActive: !current } : f)); };
  return (
    <div className='space-y-6'>
      <PageHeader title='Asset Fields Customization' description='Customize asset attributes and data fields.' backHref='/dashboard/settings' />
      <form onSubmit={handleSubmit} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <div className='md:col-span-2'><input type='text' placeholder='Field name (e.g. serial_number)' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><input type='text' placeholder='Label (e.g. Serial Number)' value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm'><option value='text'>Text</option><option value='number'>Number</option><option value='date'>Date</option><option value='select'>Select</option><option value='textarea'>Textarea</option></select></div>
          <div className='flex items-center gap-3'><label className='flex items-center gap-2 text-sm text-slate-700'><input type='checkbox' checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} className='h-4 w-4 rounded border-slate-300' /> Required</label><button type='submit' className='rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>Add</button></div>
        </div>
      </form>
      {loading ? <TableSkeleton /> : fields.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><p className='text-slate-500'>No custom fields yet.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>Name</th><th className='px-4 py-3'>Label</th><th className='px-4 py-3'>Type</th><th className='px-4 py-3'>Required</th><th className='px-4 py-3'>Active</th><th className='px-4 py-3 text-right'>Actions</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {fields.map((f) => (<tr key={f._id} className='hover:bg-slate-50'><td className='px-4 py-3 font-mono text-xs text-slate-900'>{f.name}</td><td className='px-4 py-3 text-slate-600'>{f.label}</td><td className='px-4 py-3 text-slate-600'>{f.type}</td><td className='px-4 py-3 text-slate-600'>{f.required ? 'Yes' : 'No'}</td><td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${f.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></td><td className='px-4 py-3 text-right'><button onClick={() => toggleActive(f._id, f.isActive)} className='rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600'>{f.isActive ? 'Deactivate' : 'Activate'}</button></td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}
