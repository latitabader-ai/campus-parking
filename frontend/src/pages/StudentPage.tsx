// src/pages/StudentPage.tsx — Student MVP journey: map awareness + reserve + cancel
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zonesApi } from '@/api/zones';
import { reservationsApi } from '@/api/reservations';
import { violationsApi } from '@/api/violations';
import { getZoneColor, occupancyPct } from '@/utils/zoneColor';
import ZoneStatusBadge from '@/components/ZoneStatusBadge';
import SimulatedDataBanner from '@/components/SimulatedDataBanner';
import Spinner from '@/components/Spinner';
import ErrorMessage from '@/components/ErrorMessage';
import type { Zone } from '@/types';

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default function StudentPage() {
  const qc = useQueryClient();
  const [reserveError, setReserveError] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['zones'],
    queryFn:  () => zonesApi.getAll().then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const { data: active, isLoading: activeLoading } = useQuery({
    queryKey: ['reservation-active'],
    queryFn:  () => reservationsApi.getActive().then(r => r.data.data),
    refetchInterval: 10_000,
  });

  const { data: violations } = useQuery({
    queryKey: ['my-violations'],
    queryFn:  () => violationsApi.list().then(r => r.data.data),
  });

  const reserveMutation = useMutation({
    mutationFn: (zoneId: string) => reservationsApi.create(zoneId),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['reservation-active'] }); qc.invalidateQueries({ queryKey: ['zones'] }); setReserveError(''); setSelectedZoneId(null); },
    onError:    (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Reservation failed';
      setReserveError(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['reservation-active'] }); qc.invalidateQueries({ queryKey: ['zones'] }); },
  });

  const sortedZones: Zone[] = (zones ?? []).slice().sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <SimulatedDataBanner />

      {/* Active reservation */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Your Active Reservation</h2>
        {activeLoading ? <Spinner size="sm" /> : active ? (
          <div className="card border-green-200 bg-green-50 flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="font-semibold text-green-800">{active.space.zone.name} — Space {active.space.spaceNumber}</p>
              <p className="text-sm text-green-700">Zone <strong>{active.space.zone.code}</strong></p>
              <p className="text-xs text-gray-500">Expires in <strong>{timeLeft(active.expiresAt)}</strong></p>
            </div>
            <button
              className="btn-danger text-xs shrink-0"
              onClick={() => cancelMutation.mutate(active.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <Spinner size="sm" /> : 'Cancel'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 card">No active reservation. Select an available zone below to reserve a space.</p>
        )}
      </section>

      {/* Reserve a space */}
      {!active && (
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Reserve a Parking Space</h2>
          {reserveError && <ErrorMessage msg={reserveError} />}
          {zonesLoading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedZones.map(zone => {
                const occ   = zone.occupied ?? 0;
                const total = zone.totalSpaces;
                const avail = zone.available ?? 0;
                const { color } = getZoneColor(occ, total);
                const pct = occupancyPct(occ, total);
                const isSelected = selectedZoneId === zone.id;
                return (
                  <div
                    key={zone.id}
                    className={`card cursor-pointer border-2 transition-all ${isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{zone.name}</p>
                        <p className="text-xs text-gray-500">{zone.code}</p>
                      </div>
                      <ZoneStatusBadge occupied={occ} total={total} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{avail} free</span>
                    </div>
                    {isSelected && avail > 0 && (
                      <button
                        className="btn-primary w-full mt-3 text-xs"
                        onClick={e => { e.stopPropagation(); reserveMutation.mutate(zone.id); }}
                        disabled={reserveMutation.isPending}
                      >
                        {reserveMutation.isPending ? <Spinner size="sm" /> : `Reserve in ${zone.code}`}
                      </button>
                    )}
                    {isSelected && avail === 0 && (
                      <p className="text-xs text-red-600 mt-2">No spaces available in this zone.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* My violations */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">My Violations</h2>
        {!violations || violations.length === 0 ? (
          <p className="text-sm text-gray-500 card">No violations on record for your vehicles.</p>
        ) : (
          <div className="space-y-2">
            {violations.map(v => (
              <div key={v.id} className="card flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{v.violationType.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{v.space.zone.code} · {v.space.spaceNumber} · {new Date(v.detectedAt).toLocaleDateString()}</p>
                  {v.notes && <p className="text-xs text-gray-600 mt-1">{v.notes}</p>}
                </div>
                <span className={`shrink-0 ${v.status === 'PENDING' ? 'badge-red' : v.status === 'ACKNOWLEDGED' ? 'badge-yellow' : 'badge-green'}`}>{v.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
