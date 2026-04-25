'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../context-api/UserContext';

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard/my-dashboard': {
    title: 'Asset Operations Hub',
    description: 'Monitor activity, inventory health, and team actions in one place.',
  },
  '/dashboard/devices': {
    title: 'Asset Inventory',
    description: 'Review endpoints, ownership, and lifecycle status across the fleet.',
  },
  '/dashboard/devices/add': {
    title: 'Register Asset',
    description: 'Capture a new device and assign it to the right owner or policy group.',
  },
  '/dashboard/users': {
    title: 'Access Management',
    description: 'Control user accounts, roles, and operational access.',
  },
  '/dashboard/users/add': {
    title: 'Invite Team Member',
    description: 'Add a new operator and assign the right level of responsibility.',
  },
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const { user, clearUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageMeta = useMemo(() => {
    return pageTitles[pathname] ?? pageTitles['/dashboard/my-dashboard'];
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to logout');
      clearUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      clearUser();
      window.location.href = '/';
    }
  };

  const dropdownItems = [
    {
      label: 'Add New Device',
      href: '/dashboard/devices/add',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
        </svg>
      ),
    },
    {
      label: 'Manage All Devices',
      href: '/dashboard/devices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 hidden lg:block border-b border-slate-200/70 bg-white backdrop-blur-sm shadow-md">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              RevLock Assets
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-500 text-sm font-bold text-white">
                  {user ? user.name.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {user ? `Hello, ${user.name.split(' ')[0]}` : 'Dashboard session'}
                  </p>
                  <p className="truncate text-xs text-slate-500 sm:text-sm">
                    {user ? `${user.role} - ${user.email}` : 'Authenticated workspace'}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`ml-2 shrink-0 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-500">{user?.email || 'Not signed in'}</p>
                  </div>

                  <div className="py-1">
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <span className="text-slate-400">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
