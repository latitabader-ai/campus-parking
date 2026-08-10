// src/api/client.ts
// Axios instance with base URL, auth header injection, and 401 → refresh flow.
// Full interceptor is wired up in Sub-Task 10 when authStore exists.

import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true, // Required for HttpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor attached in Sub-Task 10 (authStore must exist first).
// export function attachAuthInterceptor(getToken: () => string | null) { ... }
