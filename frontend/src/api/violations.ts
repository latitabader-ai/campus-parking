// src/api/violations.ts
import { api } from './client';

export interface ViolationSummary {
  id: string; vehiclePlate: string; violationType: string;
  detectedAt: string; status: string; notes: string | null;
  spaceId: string;
  space: { spaceNumber: string; zoneId: string; zone: { code: string; name: string } };
  reportedById: string | null; resolvedById: string | null; resolvedAt: string | null;
}

export const violationsApi = {
  list:         (params?: Record<string, string>) => api.get<{ success: boolean; data: ViolationSummary[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>('/violations', { params }),
  getById:      (id: string) => api.get<{ success: boolean; data: ViolationSummary }>(`/violations/${id}`),
  create:       (body: { spaceId: string; vehiclePlate: string; violationType: string; notes?: string }) =>
                  api.post<{ success: boolean; data: ViolationSummary }>('/violations', body),
  updateStatus: (id: string, body: { status: string; notes?: string }) =>
                  api.patch<{ success: boolean; data: ViolationSummary }>(`/violations/${id}/status`, body),
};

export const vehiclesApi = {
  lookup: (plate: string) => api.get<{ success: boolean; data: { id: string; plate: string; make: string | null; model: string | null; color: string | null; owner: { id: string; email: string; name: string; role: string } | null } }>(`/vehicles/lookup`, { params: { plate } }),
};
