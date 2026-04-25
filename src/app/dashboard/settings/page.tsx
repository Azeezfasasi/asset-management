'use client';

import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

const links = [
  { href: '/dashboard/settings/roles-permissions', title: 'Roles & Permissions', desc: 'Define user roles and access levels' },
  { href: '/dashboard/settings/asset-fields-customization', title: 'Asset Fields Customization', desc: 'Customize asset attributes and data fields' },
  { href: '/dashboard/settings/audit-logs', title: 'Audit Logs', desc: 'View system activity and changes for compliance' },
];

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Settings' description='Configure system settings and preferences.' />
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className='group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300'>
            <h3 className='text-lg font-semibold text-slate-900'>{l.title}</h3>
            <p className='mt-1 text-sm text-slate-500'>{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
