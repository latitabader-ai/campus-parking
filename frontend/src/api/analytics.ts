// src/api/analytics.ts
import { api } from './client';

interface Summary {
  totalSpaces: number; occupied: number; available: number;
  globalOccupancyPct: number; pendingViolations: number;
  activeReservations: number; registeredUsers: number;
}

export const analyticsApi = {
  summary: () => api.get<{ success: boolean; data: Summary }>('/analytics/summary'),
};
