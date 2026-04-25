'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalDevices: number;
  inStoreDevices: number;
  activeDevices: number;
  unassignedDevices: number;
  achivedDevices: number;
  totalUsers: number;
  compliantDevices: number;
}

const statCards = [
  { key: 'totalDevices', label: 'Total Assets', helper: 'Registered devices and managed endpoints', accent: 'from-blue-600 to-cyan-500' },
  { key: 'activeDevices', label: 'Active Assets', helper: 'Currently online or recently reporting', accent: 'from-emerald-600 to-lime-500' },
  { key: 'unassignedDevices', label: 'Unassigned Assets', helper: 'Devices without an assigned user or owner', accent: 'from-emerald-600 to-lime-500' },
  { key: 'inStoreDevices', label: 'In Store', helper: 'Assets currently in retail locations or warehouses', accent: 'from-blue-600 to-cyan-500' },
  { key: 'achivedDevices', label: 'Archived Assets', helper: 'Devices that have been retired or archived', accent: 'from-emerald-600 to-lime-500' },
  { key: 'totalUsers', label: 'Assigned Users', helper: 'Operators and owners with active access', accent: 'from-amber-500 to-orange-500' },
  { key: 'compliantDevices', label: 'Compliant Assets', helper: 'Meeting the latest baseline requirements', accent: 'from-fuchsia-600 to-violet-500' },
];

const quickActions = [
  { href: '/dashboard/devices/add', title: 'Register New Asset', description: 'Capture a new laptop, phone, or tablet and bring it into management.', accent: 'from-blue-600 to-cyan-500' },
  { href: '/dashboard/users/add', title: 'Assign New User', description: 'Create a user profile and connect them to the right asset workflow.', accent: 'from-emerald-600 to-teal-500' },
];

export default function MyDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats', { credentials: 'include', cache: 'no-store' });
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchStats();
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
        <div className="text-xl text-slate-700">Loading dashboard...</div>
      </div>
    );
  }
  const s = stats || { totalDevices: 0, inStoreDevices: 0, activeDevices: 0, unassignedDevices: 0, achivedDevices: 0, totalUsers: 0, compliantDevices: 0 };
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`h-12 w-12 rounded-2xl bg-linear-to-br ${card.accent}`} />
            <p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{(s as unknown as Record<string, number>)[card.key] ?? 0}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{card.helper}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Quick Actions</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Keep asset workflows moving</h2>
            </div>
            <button onClick={fetchStats} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">Refresh Metrics</button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href} className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                <div className={`h-11 w-11 rounded-2xl bg-linear-to-br ${a.accent}`} />
                <p className="mt-5 text-lg font-semibold text-slate-950">{a.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{a.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Asset Overview</p>
          <h2 className="mt-3 text-2xl font-semibold">Management priorities</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">Use this space to surface the metrics and follow-up actions that matter most to your asset operations team.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Asset coverage</p>
              <p className="mt-1 text-lg font-semibold text-white">{s.totalDevices}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">User assignments</p>
              <p className="mt-1 text-lg font-semibold text-white">{s.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Compliance status</p>
              <p className="mt-1 text-lg font-semibold text-white">{s.compliantDevices}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
