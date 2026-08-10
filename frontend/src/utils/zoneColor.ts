// src/utils/zoneColor.ts
export type ZoneStatus = 'AVAILABLE' | 'LIMITED' | 'FULL';
export interface ZoneColorResult { color: string; borderColor: string; status: ZoneStatus; label: string; badgeClass: string; }

export function getZoneColor(occupied: number, total: number): ZoneColorResult {
  if (total === 0) return { color: '#9ca3af', borderColor: '#6b7280', status: 'FULL', label: 'No Data', badgeClass: 'badge-gray' };
  const pct = (occupied / total) * 100;
  if (pct > 85) return { color: '#ef4444', borderColor: '#dc2626', status: 'FULL',      label: 'Full',      badgeClass: 'badge-red'    };
  if (pct > 60) return { color: '#f59e0b', borderColor: '#d97706', status: 'LIMITED',   label: 'Limited',   badgeClass: 'badge-yellow' };
  return             { color: '#22c55e', borderColor: '#16a34a', status: 'AVAILABLE', label: 'Available', badgeClass: 'badge-green'  };
}

export const occupancyPct = (occ: number, total: number) =>
  total > 0 ? Math.round((occ / total) * 100) : 0;
