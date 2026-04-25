'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface V { _id: string; name: string; contactPerson?: string; email: string; phone?: string; status: string; }

export default function VendorsPage() {
  const [vendors, setVendors] = useState<V[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', status: 'Active' });
  const [editing, setEditing] = useState<V | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fetchVendors = () => { fetch('/api/vendors').then((r) => r.json()).then((d) => { setVendors(d.vendors || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchVendors(); }, []);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); const url = editing ? `/api/vendors/${editing._id}` : '/api/vendors'; const method = editing ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (res.ok) { setForm({ name: '', contactPerson: '', email: '', phone: '', status: 'Active' }); setEditing(null); fetchVendors(); } };
  const handleDelete = async () => { if (!deleteId) return; const res = await fetch(`/api/vendors/${deleteId}`, { method: 'DELETE' }); if (res.ok) setVendors((p) => p.filter((v) => v._id !== deleteId)); setDeleteId(null); };
  return (
    <div className='space-y-6'>
      <PageHeader title='Vendor List & Contacts' description='Manage vendor relationships and contacts.' />
      <form onSubmit={handleSubmit} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <div className='md:col-span-2'><input type='text' placeholder='Vendor name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><input type='text' placeholder='Contact person' value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><input type='email' placeholder='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div className='flex gap-2'><input type='text' placeholder='Phone' value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /><button type='submit' className='shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>{editing ? 'Update' : 'Add'}</button>{editing && <button type='button' onClick={() => { setEditing(null); setForm({ name: '', contactPerson: '', email: '', phone: '', status: 'Active' }); }} className='shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700'>Cancel</button>}</div>
        </div>
      </form>
      {loading ? <TableSkeleton /> : vendors.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><p className='text-slate-500'>No vendors yet.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>Name</th><th className='px-4 py-3'>Contact</th><th className='px-4 py-3'>Email</th><th className='px-4 py-3'>Phone</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3 text-right'>Actions</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {vendors.map((v) => (<tr key={v._id} className='hover:bg-slate-50'><td className='px-4 py-3 font-medium text-slate-900'>{v.name}</td><td className='px-4 py-3 text-slate-600'>{v.contactPerson || '—'}</td><td className='px-4 py-3 text-slate-600'>{v.email}</td><td className='px-4 py-3 text-slate-600'>{v.phone || '—'}</td><td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : v.status === 'Blacklisted' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>{v.status}</span></td><td className='px-4 py-3 text-right'><button onClick={() => { setEditing(v); setForm({ name: v.name, contactPerson: v.contactPerson || '', email: v.email, phone: v.phone || '', status: v.status }); }} className='mr-2 rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600'>Edit</button><button onClick={() => setDeleteId(v._id)} className='rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600'>Delete</button></td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title='Delete Vendor' message='This cannot be undone.' confirmLabel='Delete' variant='danger' onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
