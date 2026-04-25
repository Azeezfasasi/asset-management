'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { getRoleConfig } from '@/components/context-api/UserContext';

interface User { _id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => { fetch('/api/users').then((r) => r.json()).then((d) => { setUsers(d.users || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const toggleStatus = async (id: string, current: boolean) => { const res = await fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) }); if (res.ok) setUsers((p) => p.map((u) => u._id === id ? { ...u, isActive: !current } : u)); };
  const handleDelete = async () => { if (!deleteId) return; const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' }); if (res.ok) setUsers((p) => p.filter((u) => u._id !== deleteId)); setDeleteId(null); };
  const filtered = users.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()) || u.role.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className='space-y-6'>
      <PageHeader title='Access Management' description='Control user accounts, roles, and operational access.' action={{ label: 'Invite User', href: '/dashboard/users/add' }} />
      <div className='relative max-w-md'>
        <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg>
        <input type='text' placeholder='Search users by name, email, or role...' value={filter} onChange={(e) => setFilter(e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400' />
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No users found</h3></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>User</th><th className='px-4 py-3'>Email</th><th className='px-4 py-3'>Role</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'>Joined</th><th className='px-4 py-3 text-right'>Actions</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {filtered.map((u) => (<tr key={u._id} className='hover:bg-slate-50'><td className='px-4 py-3 font-medium text-slate-900'>{u.name}</td><td className='px-4 py-3 text-slate-600'>{u.email}</td><td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleConfig(u.role).badgeClassName}`}>{u.role}</span></td><td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td><td className='px-4 py-3 text-slate-500'>{new Date(u.createdAt).toLocaleDateString()}</td><td className='px-4 py-3 text-right'><div className='flex items-center justify-end gap-2'><button onClick={() => toggleStatus(u._id, u.isActive)} className='rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600' title='Toggle status'><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/><path d='M3 3v5h5'/><path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16'/><path d='M16 21h5v-5'/></svg></button><button onClick={() => setDeleteId(u._id)} className='rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600' title='Delete'><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 6h18'/><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/></svg></button></div></td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title='Delete User' message='This cannot be undone.' confirmLabel='Delete' variant='danger' onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
