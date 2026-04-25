'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface PO { _id: string; poNumber: string; vendor: { name: string }; totalAmount: number; status: string; orderDate: string; deliveryDate?: string; }

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/purchase-orders').then((r) => r.json()).then((d) => { setPos(d.orders || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div className='space-y-6'>
      <PageHeader title='Purchase Orders' description='View and manage procurement orders.' backHref='/dashboard/vendors' />
      {loading ? <TableSkeleton /> : pos.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-12 text-center'><h3 className='text-lg font-semibold text-slate-900'>No purchase orders</h3><p className='mt-1 text-sm text-slate-500'>Orders will appear here.</p></div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500'><tr><th className='px-4 py-3'>PO Number</th><th className='px-4 py-3'>Vendor</th><th className='px-4 py-3'>Amount</th><th className='px-4 py-3'>Status</th><th className='px-4 py-3'>Order Date</th><th className='px-4 py-3'>Delivery</th></tr></thead><tbody className='divide-y divide-slate-100'>
              {pos.map((o) => (<tr key={o._id} className='hover:bg-slate-50'><td className='px-4 py-3 font-medium text-slate-900'>{o.poNumber}</td><td className='px-4 py-3 text-slate-600'>{o.vendor?.name || '—'}</td><td className='px-4 py-3 text-slate-600'>${o.totalAmount}</td><td className='px-4 py-3'><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${o.status === 'Received' ? 'bg-emerald-100 text-emerald-800' : o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{o.status}</span></td><td className='px-4 py-3 text-slate-500'>{new Date(o.orderDate).toLocaleDateString()}</td><td className='px-4 py-3 text-slate-500'>{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : '—'}</td></tr>))}
            </tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}
