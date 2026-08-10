// src/api/zones.ts
import { api } from './client';
import type { Zone } from '@/types';

export const zonesApi = {
  getPublic: () => api.get<{ success: boolean; data: Zone[] }>('/zones/public'),
  getAll:    () => api.get<{ success: boolean; data: Zone[] }>('/zones'),
  getById:   (id: string) => api.get<{ success: boolean; data: Zone }>(`/zones/${id}`),
};
