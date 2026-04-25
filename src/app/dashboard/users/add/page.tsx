'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { ROLE_OPTIONS } from '@/components/context-api/UserContext';

export default function AddUserPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'User' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const data = await res.json(); if (res.ok) { router.push('/dashboard/users'); } else { setError(data.error || 'Failed to add user'); } } catch { setError('Network error. Please try again.'); } finally { setLoading(false); }
  };
  return (
    <div className='space-y-6'>
      <PageHeader title='Invite Team Member' description='Add a new operator and assign the right level of responsibility.' backHref='/dashboard/users' />
      {error && <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'>{error}</div>}
      <form onSubmit={handleSubmit} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div><label className='block text-sm font-medium text-slate-700'>Full Name *</label><input type='text' name='name' value={form.name} onChange={handleChange} required className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><label className='block text-sm font-medium text-slate-700'>Email *</label><input type='email' name='email' value={form.email} onChange={handleChange} required className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><label className='block text-sm font-medium text-slate-700'>Password *</label><input type='password' name='password' value={form.password} onChange={handleChange} required minLength={6} className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' /></div>
          <div><label className='block text-sm font-medium text-slate-700'>Role *</label><select name='role' value={form.role} onChange={handleChange} required className='mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400'>{ROLE_OPTIONS.slice().reverse().map((r) => (<option key={r} value={r}>{r}</option>))}</select></div>
        </div>
        <div className='flex justify-end gap-3'><button type='button' onClick={() => router.push('/dashboard/users')} className='rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'>Cancel</button><button type='submit' disabled={loading} className='rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50'>{loading ? 'Adding...' : 'Add User'}</button></div>
      </form>
    </div>
  );
}
