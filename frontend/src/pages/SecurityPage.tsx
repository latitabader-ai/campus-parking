// src/pages/SecurityPage.tsx — Security Staff: violations dashboard + plate lookup
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { violationsApi, vehiclesApi } from '@/api/violations';
import { zonesApi } from '@/api/zones';
import { analyticsApi } from '@/api/analytics';
import Spinner from '@/components/Spinner';
import ErrorMessage from '@/components/ErrorMessage';

function ViolationBadge({ status }: { status: string }) {
  const cls: Record<string, string> = { PENDING: 'badge-red', ACKNOWLEDGED: 'badge-yellow', RESOLVED: 'badge-green', DISMISSED: 'badge-gray' };
  return <span className={cls[status] ?? 'badge-gray'}>{status}</span>;
}

export default function SecurityPage() {
  const qc = useQueryClient();
  const [plate, setPlate]         = useState('');
  const [lookupResult, setLookup] = useState<{ id: string; plate: string; make: string | null; model: string | null; color: string | null; owner: { id: string; email: string; name: string; role: string } | null } | null | 'not_found'>(null);
  const [lookupErr, setLookupErr] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [newForm, setNewForm]     = useState({ spaceId: '', vehiclePlate: '', violationType: 'NO_PERMIT', notes: '' });
  const [newErr, setNewErr]       = useState('');
  const [statusFilter, setFilter] = useState('');

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn:  () => analyticsApi.summary().then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const { data: violations, isLoading } = useQuery({
    queryKey: ['violations', statusFilter],
    queryFn:  () => violationsApi.list(statusFilter ? { status: statusFilter } : undefined).then(r => r.data),
    refetchInterval: 15_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      violationsApi.updateStatus(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['violations'] }),
  });

  const createMutation = useMutation({
    mutationFn: () => violationsApi.create({
      spaceId:       newForm.spaceId,
      vehiclePlate:  newForm.vehiclePlate,
      violationType: newForm.violationType,
      notes:         newForm.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['violations'] });
      setShowNew(false);
      setNewForm({ spaceId: '', vehiclePlate: '', violationType: 'NO_PERMIT', notes: '' });
      setNewErr('');
    },
    onError: (err: unknown) => {
      setNewErr((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed');
    },
  });

  const handleLookup = async () => {
    setLookupErr(''); setLookup(null);
    if (!plate.trim()) return;
    try {
      const r = await vehiclesApi.lookup(plate.trim().toUpperCase());
      setLookup(r.data.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) { setLookup('not_found'); }
      else { setLookupErr('Lookup failed'); }
    }
  };

  const { data: zones } = useQuery({
    queryKey: ['zones-minimal'],
    queryFn:  () => zonesApi.getAll().then(r => r.data.data),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Spaces',     value: summary.totalSpaces          },
            { label: 'Occupied',         value: `${summary.occupied} (${summary.globalOccupancyPct}%)` },
            { label: 'Pending Violations', value: summary.pendingViolations  },
            { label: 'Active Reservations', value: summary.activeReservations },
          ].map(c => (
            <div key={c.label} className="card text-center">
              <p className="text-2xl font-bold text-green-700">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Plate lookup */}
      <section className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Vehicle Plate Lookup</h2>
        <div className="flex gap-2">
          <input className="input max-w-xs" placeholder="e.g. BKT-2201" value={plate}
            onChange={e => setPlate(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()} />
          <button className="btn-secondary" onClick={handleLookup}>Lookup</button>
        </div>
        {lookupErr && <p className="text-sm text-red-600 mt-2">{lookupErr}</p>}
        {lookupResult === 'not_found' && <p className="text-sm text-gray-500 mt-2">No vehicle found with plate <strong>{plate}</strong>.</p>}
        {lookupResult && lookupResult !== 'not_found' && (
          <div className="mt-3 text-sm space-y-0.5">
            <p><span className="text-gray-500">Plate:</span> <strong>{lookupResult.plate}</strong></p>
            <p><span className="text-gray-500">Vehicle:</span> {[lookupResult.color, lookupResult.make, lookupResult.model].filter(Boolean).join(' ') || '—'}</p>
            {lookupResult.owner
              ? <p><span className="text-gray-500">Owner:</span> {lookupResult.owner.name} ({lookupResult.owner.email}) — {lookupResult.owner.role}</p>
              : <p className="text-gray-500">Owner: Guest / Unregistered</p>}
          </div>
        )}
      </section>

      {/* Violations list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Violations</h2>
          <div className="flex items-center gap-2">
            <select className="input w-auto text-xs" value={statusFilter} onChange={e => setFilter(e.target.value)}>
              <option value="">All statuses</option>
              {['PENDING','ACKNOWLEDGED','RESOLVED','DISMISSED'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-primary text-xs" onClick={() => setShowNew(true)}>+ New</button>
          </div>
        </div>

        {showNew && (
          <div className="card mb-4 border-green-200 bg-green-50 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Log New Violation</h3>
            {newErr && <ErrorMessage msg={newErr} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Plate</label>
                <input className="input" placeholder="e.g. BKT-2201" value={newForm.vehiclePlate}
                  onChange={e => setNewForm(f => ({ ...f, vehiclePlate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Violation Type</label>
                <select className="input" value={newForm.violationType}
                  onChange={e => setNewForm(f => ({ ...f, violationType: e.target.value }))}>
                  {['UNAUTHORIZED_ZONE','OVERSTAY','NO_PERMIT','DOUBLE_PARK','OTHER'].map(t =>
                    <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Space ID</label>
                <select className="input" value={newForm.spaceId}
                  onChange={e => setNewForm(f => ({ ...f, spaceId: e.target.value }))}>
                  <option value="">Select a zone first…</option>
                  {(zones ?? []).map(z => <option key={z.id} value={z.id}>{z.code} — {z.name} (use zone id as proxy)</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-0.5">In MVP: paste a space UUID from the API or use zone ID as reference.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input className="input" placeholder="Optional notes" value={newForm.notes}
                  onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-xs" onClick={() => createMutation.mutate()} disabled={!newForm.spaceId || !newForm.vehiclePlate || createMutation.isPending}>
                {createMutation.isPending ? <Spinner size="sm" /> : 'Log Violation'}
              </button>
              <button className="btn-secondary text-xs" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        )}

        {isLoading ? <Spinner /> : !violations?.data?.length ? (
          <p className="text-sm text-gray-500 card">No violations found.</p>
        ) : (
          <div className="space-y-2">
            {violations.data.map(v => (
              <div key={v.id} className="card flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{v.vehiclePlate}</span>
                    <span className="text-xs text-gray-500">{v.violationType.replace(/_/g,' ')}</span>
                    <ViolationBadge status={v.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{v.space.zone.code} · {v.space.spaceNumber} · {new Date(v.detectedAt).toLocaleString()}</p>
                  {v.notes && <p className="text-xs text-gray-600 mt-1">{v.notes}</p>}
                </div>
                {(v.status === 'PENDING' || v.status === 'ACKNOWLEDGED') && (
                  <div className="flex flex-col gap-1 shrink-0">
                    {v.status === 'PENDING' && (
                      <button className="btn-secondary text-xs py-1" onClick={() => updateMutation.mutate({ id: v.id, status: 'ACKNOWLEDGED' })}>
                        Acknowledge
                      </button>
                    )}
                    <button className="btn-primary text-xs py-1" onClick={() => updateMutation.mutate({ id: v.id, status: 'RESOLVED' })}>
                      Resolve
                    </button>
                    <button className="text-xs text-gray-400 hover:text-gray-600 underline" onClick={() => updateMutation.mutate({ id: v.id, status: 'DISMISSED' })}>
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
