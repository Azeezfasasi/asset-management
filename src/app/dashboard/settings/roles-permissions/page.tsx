'use client';

import PageHeader from '@/components/ui/PageHeader';
import { ROLE_OPTIONS, ROLE_MAP } from '@/components/context-api/UserContext';

export default function RolesPermissionsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Roles & Permissions' description='Define user roles and access levels.' backHref='/dashboard/settings' />
      <div className='grid gap-4 md:grid-cols-2'>
        {ROLE_OPTIONS.map((role) => (
          <div key={role} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-3'>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${ROLE_MAP[role].badgeClassName}`}>{role}</span>
              <span className='text-xs text-slate-400'>Rank: {ROLE_MAP[role].rank}</span>
            </div>
            <p className='mt-3 text-sm text-slate-600'>
              {role === 'Super Admin' ? 'Full system access. Can manage everything including other admins.' : role === 'Admin' ? 'Can manage devices, users, vendors, and most system settings.' : role === 'Manager' ? 'Can view and manage devices and users but limited settings access.' : 'Basic access. Can view assigned devices and personal information.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
