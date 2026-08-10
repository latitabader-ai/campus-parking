// src/utils/zoneColor.ts
// Pure utility: maps zone occupancy to a colour hex and a status label.
// Thresholds: ≤60% → green, 61–85% → yellow, >85% → red.
// Used by ParkingMap polygon fill and the availability legend.

import type { ZoneAvailabilityStatus } from '@/types';

export interface ZoneColorResult {
  color: string;        // Leaflet fillColor / CSS hex
  borderColor: string;  // Slightly darker border
  status: ZoneAvailabilityStatus;
  label: string;        // Human-readable label for tooltips
}

export function getZoneColor(occupied: number, total: number): ZoneColorResult {
  if (total === 0) {
    return { color: '#9ca3af', borderColor: '#6b7280', status: 'FULL', label: 'No Data' };
  }

  const pct = (occupied / total) * 100;

  if (pct > 85) {
    return { color: '#ef4444', borderColor: '#dc2626', status: 'FULL',      label: 'Full'      };
  }
  if (pct > 60) {
    return { color: '#f59e0b', borderColor: '#d97706', status: 'LIMITED',   label: 'Limited'   };
  }
  return   { color: '#22c55e', borderColor: '#16a34a', status: 'AVAILABLE', label: 'Available' };
}

export function occupancyPercent(occupied: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((occupied / total) * 100);
}
