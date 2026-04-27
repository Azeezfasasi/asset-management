'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Device { _id: string; deviceName: string; }
interface MR { _id: string; device: { deviceName: string; modelName: string }; type: string; description: string; status: string; scheduledDate: string; cost?: number; }

const STATUS_COLORS: Record<string, string> = { Scheduled: 'bg-blue-100 text-blue-800', 'In Progress': 'bg-amber-100 text-amber-800', Completed: 'bg-emerald-100 text-emerald-800', Cancelled: 'bg-slate-100 text-slate-800', Overdue: 'bg-red-100 text-red-800' };

export default function MaintenancePage() {
  const [records, setRecords] = useState<MR[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MR | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState({ device: '', type: 'Repair', description: '', status: 'Scheduled', scheduledDate: '', cost: '', technician: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = () => { fetch('/api/maintenance').then((r) => r.json()).then((d) => { setRecords(d.records || []); setLoading(false); }).catch(() => setLoading(false)); };
  const fetchDevices = () => { fetch('/api/devices').then((r) => r.json()).then((d) => { setDevices((d.devices || []).map((dev: { _id: string; deviceName: string }) => ({ _id: dev._id, deviceName: dev.deviceName }))); }).catch(() => {}); };

  useEffect(() => { fetchRecords(); fetchDevices(); }, []);

  const openAdd = () => { setEditing(null); setForm({ device: '', type: 'Repair', description: '', status: 'Scheduled', scheduledDate: '', cost: '', technician: '', notes: '' }); setShowForm(true); };
  const openEdit = (r: MR) => { setEditing(r); setForm({ device: '', type: r.type, description: r.description, status: r.status, scheduledDate: r.scheduledDate ? new Date(r.scheduledDate).toISOString().slice(0, 16) : '', cost: r.cost != null ? String(r.cost) : '', technician: '', notes: '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const body: Record<string, unknown> = { device: form.device, type: form.type, description: form.description, status: form.status, scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined, cost: form.cost ? parseFloat(form.cost) : undefined, technician: form.technician || undefined, notes: form.notes || undefined };
    const url = editing ? `/api/maintenance/${editing._id}` : '/api/maintenance'; const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); fetchRecords(); }
    setSubmitting(false);
  };

  const handleDelete = async () => { if (!deleteId) return; const res = await fetch(`/api/maintenance/${deleteId}`, { method: 'DELETE' }); if (res.ok) setRecords((p) => p.filter((r) => r._id !== deleteId)); setDeleteId(null); };

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance / Repairs" description="Schedule and track maintenance activities." />
      <button onClick={openAdd} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">+ Add Record</button>
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{editing ? 'Edit Record' : 'New Record'}</h3>
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="block text-sm font-medium text-slate-700">Device *</label><select value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm"><option value="">Select</option>{devices.map((d) => (<option key={d._id} value={d._id}>{d.deviceName}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-slate-700">Type *</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm">{['Repair','Upgrade','Inspection','Calibration','Cleaning','Other'].map((t) => (<option key={t} value={t}>{t}</option>))}</select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700">Description *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={2} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm">{['Scheduled','In Progress','Completed','Cancelled','Overdue'].map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-slate-700">Scheduled Date *</label><input type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Cost ($)</label><input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Technician</label><input type="text" value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm" /></div>
            <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Cancel</button><button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Saving...' : (editing ? 'Save' : 'Add')}</button></div>
          </form>
        </div>
      )}
      {loading ? <TableSkeleton /> : records.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><h3 className="text-lg font-semibold text-slate-900">No records</h3><p className="mt-1 text-sm text-slate-500">Records will appear here.</p></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr><th className="px-4 py-3">Device</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Scheduled</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{r.device?.deviceName || '—'}</div>
                      <div className="text-xs text-slate-500">{r.device?.modelName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-800'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.scheduledDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{r.cost != null ? `$${r.cost}` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button onClick={() => setDeleteId(r._id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title="Delete Record" message="Are you sure?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
