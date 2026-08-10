// src/api/client.ts — Axios instance with Bearer token injection + 401 refresh
import axios, { AxiosInstance } from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from in-memory store (set after login/refresh)
let _token: string | null = null;
export const setToken = (t: string | null) => { _token = t; };

api.interceptors.request.use(cfg => {
  if (_token) cfg.headers.Authorization = `Bearer ${_token}`;
  return cfg;
});

// On 401 attempt one silent refresh then retry once
api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/v1/auth/refresh`, {}, { withCredentials: true },
        );
        const newToken = data.data.accessToken as string;
        setToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch { setToken(null); }
    }
    return Promise.reject(err);
  },
);
