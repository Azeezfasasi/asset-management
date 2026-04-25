import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/dashboard-components/DashboardHeader';
import DashboardMenu from '@/components/dashboard-components/DashboardMenu';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff,#f8fafc_45%,#e5e7eb)]">
        <DashboardHeader />
        <div className="mx-auto flex min-h-screen w-full flex-col gap-6 px-0 py-0 sm:px-6 lg:flex-row lg:px-0">
          <DashboardMenu />
          <main className="flex-1 py-2 px-0">
            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur">
              {/* <DashboardHeader /> */}
              <section className="px-6 py-8 sm:px-8">{children}</section>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
