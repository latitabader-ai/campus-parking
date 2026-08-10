// src/api/auth.ts
import { api } from './client';
import type { User } from '@/types';

export const authApi = {
  login:    (email: string, password: string) =>
              api.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
              api.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/register', { email, password, name }),
  logout:   () => api.post('/auth/logout'),
  me:       () => api.get<{ success: boolean; data: { user: User } }>('/auth/me'),
};
