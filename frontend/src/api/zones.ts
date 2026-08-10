// src/api/zones.ts
import { api } from './client';
import type { Zone } from '@/types';

export interface ZoneSpaceSummary {
  id: string;
  spaceNumber: string;
  status: string;
}

export const zonesApi = {
  getPublic: () => api.get<{ success: boolean; data: Zone[] }>('/zones/public'),
  getAll:    () => api.get<{ success: boolean; data: Zone[] }>('/zones'),
  getById:   (id: string) => api.get<{ success: boolean; data: Zone }>(`/zones/${id}`),
  /** Returns OCCUPIED + AVAILABLE spaces for a zone (up to 500). */
  getZoneSpaces: (zoneId: string) =>
    api.get<{ success: boolean; data: ZoneSpaceSummary[] }>(
      `/zones/${zoneId}/spaces`,
      { params: { limit: 500 } },
    ),
};
