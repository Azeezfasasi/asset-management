'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { FormSkeleton } from '@/components/ui/LoadingSkeleton';

interface User { _id: string; name: string; email: string; }
interface Category { _id: string; name: string; color: string; }
interface AssetField {
  _id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  isActive?: boolean;
}

export default function AddDevicePage() {
  const [formData, setFormData] = useState({
    imei: '',
    deviceName: '',
    modelName: '',
    manufacturer: '',
    os: 'Android',
    osVersion: '',
    status: 'In Store',
    category: '',
    assignedTo: '',
    complianceStatus: 'Unknown',
    batteryLevel: '',
    storageUsed: '',
    storageTotal: '',
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assetFields, setAssetFields] = useState<AssetField[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const [usersRes, catsRes, fieldsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/categories?isActive=true'),
          fetch('/api/asset-fields'),
        ]);
        const [usersData, catsData, fieldsData] = await Promise.all([
          usersRes.json(),
          catsRes.json(),
          fieldsRes.json(),
        ]);
        if (mounted) {
          setUsers(usersData.users || []);
          setCategories(catsData.categories || []);
          setAssetFields((fieldsData.fields || []).filter((f: AssetField) => f.isActive !== false));
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setPageLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomFieldChange = (name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = {
        ...formData,
        assignedTo: formData.assignedTo || undefined,
        batteryLevel: formData.batteryLevel ? parseInt(formData.batteryLevel) : undefined,
        storageUsed: formData.storageUsed ? parseInt(formData.storageUsed) : undefined,
        storageTotal: formData.storageTotal ? parseInt(formData.storageTotal) : undefined,
        customFields: customFieldValues,
      };
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess(`Device created successfully with Asset Tag: ${json.device.assetTag}`);
        setFormData({
          imei: '',
          deviceName: '',
          modelName: '',
          manufacturer: '',
          os: 'Android',
          osVersion: '',
          status: 'In Store',
          category: '',
          assignedTo: '',
          complianceStatus: 'Unknown',
          batteryLevel: '',
          storageUsed: '',
          storageTotal: '',
        });
        setCustomFieldValues({});
        setTimeout(() => router.push('/dashboard/devices'), 1500);
      } else {
        setError(json.error || 'Failed to add device');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let devices;
      try {
        devices = JSON.parse(bulkJson);
      } catch {
        setError('Invalid JSON format');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/devices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devices }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess(`${json.results.success.length} devices created. ${json.results.failed.length} failed.`);
        setBulkJson('');
      } else {
        setError(json.error || 'Bulk upload failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCustomField = (field: AssetField) => {
    const value = customFieldValues[field.name] ?? field.defaultValue ?? '';
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={String(value)}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            required={field.required}
            rows={3}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        );
      case 'select':
        return (
          <select
            id={field.name}
            value={String(value)}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            required={field.required}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'multiselect':
        const selected = Array.isArray(value) ? value : value ? [String(value)] : [];
        return (
          <select
            id={field.name}
            multiple
            value={selected}
            onChange={(e) => {
              const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
              handleCustomFieldChange(field.name, vals);
            }}
            required={field.required}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm"
          >
            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleCustomFieldChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            {field.label}
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            value={String(value)}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value ? Number(e.target.value) : '')}
            required={field.required}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            id={field.name}
            value={String(value)}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            required={field.required}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        );
      default:
        return (
          <input
            type="text"
            id={field.name}
            value={String(value)}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            required={field.required}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        );
    }
  };

  if (pageLoading) return <div className="py-12"><FormSkeleton /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register Asset"
        description="Capture a new device and assign it to the right owner or policy group."
        backHref="/dashboard/devices"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{success}</div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setBulkMode(false)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${!bulkMode ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          Single Device
        </button>
        <button
          type="button"
          onClick={() => setBulkMode(true)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${bulkMode ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          Bulk Upload (JSON)
        </button>
      </div>

      {bulkMode ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <p className="text-sm text-slate-600">
            Paste a JSON array of device objects. Each object must include: imei, deviceName, modelName, manufacturer, os, osVersion, category.
            Optional fields: status, assignedTo, complianceStatus, location, batteryLevel, storageUsed, storageTotal, customFields.
          </p>
          <textarea
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            placeholder={`[\n  {\n    "imei": "123456789012345",\n    "deviceName": "iPhone 15",\n    "modelName": "A2848",\n    "manufacturer": "Apple",\n    "os": "iOS",\n    "osVersion": "17.0",\n    "category": "cat_id_here"\n  }\n]`}
            rows={12}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/devices')}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Devices'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { id: 'imei', label: 'IMEI *', type: 'text', required: true },
              { id: 'deviceName', label: 'Device Name *', type: 'text', required: true },
              { id: 'modelName', label: 'Model *', type: 'text', required: true },
              { id: 'manufacturer', label: 'Manufacturer *', type: 'text', required: true },
              { id: 'osVersion', label: 'OS Version *', type: 'text', required: true },
              { id: 'batteryLevel', label: 'Battery Level (%)', type: 'number' },
              { id: 'storageUsed', label: 'Storage Used (MB)', type: 'number' },
              { id: 'storageTotal', label: 'Storage Total (MB)', type: 'number' },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-slate-700">{f.label}</label>
                <input
                  type={f.type}
                  id={f.id}
                  name={f.id}
                  value={(formData as Record<string, string>)[f.id]}
                  onChange={handleChange}
                  required={f.required}
                  min={f.type === 'number' ? '0' : undefined}
                  max={f.id === 'batteryLevel' ? '100' : undefined}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            ))}

            <div>
              <label htmlFor="os" className="block text-sm font-medium text-slate-700">Operating System *</label>
              <select id="os" name="os" value={formData.os} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm">
                <option>Android</option>
                <option>iOS</option>
                <option>Windows</option>
                <option>macOS</option>
                <option>Linux</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm">
                <option>In Store</option>
                <option>Active</option>
                <option>In-Repair</option>
                <option>Transferred</option>
                <option>Lost</option>
                <option>Damaged</option>
                <option>Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category *</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm">
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700">Assigned To</label>
              <select id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm">
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="complianceStatus" className="block text-sm font-medium text-slate-700">Compliance Status</label>
              <select id="complianceStatus" name="complianceStatus" value={formData.complianceStatus} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm">
                <option>Compliant</option>
                <option>Non-Compliant</option>
                <option>Unknown</option>
              </select>
            </div>

            {/* Asset Tag (read-only preview) */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Asset Tag</label>
              <div className="mt-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
                Auto-generated on save
              </div>
            </div>
          </div>

          {/* Custom Asset Fields */}
          {assetFields.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Custom Fields</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {assetFields.map((field) => (
                  <div key={field._id}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderCustomField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/devices')}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Device'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

