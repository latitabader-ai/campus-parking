// src/api/reservations.ts
import { api } from './client';

export interface ReservationData {
  id: string; status: string; expiresAt: string; createdAt: string;
  userId: string;
  space: { id: string; spaceNumber: string; zoneId: string; zone: { id: string; code: string; name: string } };
}

export const reservationsApi = {
  create:    (zoneId: string) => api.post<{ success: boolean; data: ReservationData }>('/reservations', { zoneId }),
  getActive: () => api.get<{ success: boolean; data: ReservationData | null }>('/reservations/active'),
  getMy:     () => api.get<{ success: boolean; data: ReservationData[] }>('/reservations/my'),
  cancel:    (id: string) => api.delete<{ success: boolean; data: ReservationData }>(`/reservations/${id}/cancel`),
};
