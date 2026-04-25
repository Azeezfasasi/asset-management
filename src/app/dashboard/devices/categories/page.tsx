'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Category { _id: string; name: string; description?: string; deviceCount: number; isActive: boolean; color: string; }

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fetchCats = () => { fetch('/api/categories').then((r) => r.json()).then((d) => { setCats(d.categories || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchCats(); }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/categories/${editing._id}` : '/api/categories';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: '', description: '', color: '#3b82f6' }); setEditing(null); fetchCats(); }
  };
  const handleDelete = async () => { if (!deleteId) return; const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' }); if (res.ok) { setCats((p) => p.filter((c) => c._id !== deleteId)); } setDeleteId(null); };
  return (
    <div className='space-y-6'>
      <PageHeader title='Category Management' description='Define and organize asset types.' backHref='/dashboard/devices' />
      <form onSubmit={handleSubmit} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='md:col-span-2'><input type='text' placeholder='Category name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><input type='text' placeholder='Description' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div className='flex gap-2'><input type='color' value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className='h-10 w-10 rounded-lg border border-slate-200' /><button type='submit' className='flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>{editing ? 'Update' : 'Add'}</button>{editing && <button type='button' onClick={() => { setEditing(null); setForm({ name: '', description: '', color: '#3b82f6' }); }} className='rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700'>Cancel</button>}</div>
        </div>
      </form>
      {loading ? <TableSkeleton /> : cats.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><p className='text-slate-500'>No categories yet.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>Name</th><th className='px-4 py-3'>Description</th><th className='px-4 py-3'>Devices</th><th className='px-4 py-3 text-right'>Actions</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {cats.map((c) => (<tr key={c._id} className='hover:bg-slate-50'><td className='px-4 py-3 font-medium text-slate-900'><span className='mr-2 inline-block h-3 w-3 rounded-full' style={{ backgroundColor: c.color }} />{c.name}</td><td className='px-4 py-3 text-slate-600'>{c.description || '—'}</td><td className='px-4 py-3 text-slate-600'>{c.deviceCount}</td><td className='px-4 py-3 text-right'><button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '', color: c.color }); }} className='mr-2 rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600'>Edit</button><button onClick={() => setDeleteId(c._id)} className='rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600'>Delete</button></td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title='Delete Category' message='This cannot be undone.' confirmLabel='Delete' variant='danger' onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
