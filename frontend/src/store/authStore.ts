// src/store/authStore.ts — Zustand auth slice
import { create } from 'zustand';
import type { User } from '@/types';
import { setToken } from '@/api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setAuth:   (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading:(v: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user:      null,
  isLoading: true,
  setAuth:   (user, token) => { setToken(token); set({ user, isLoading: false }); },
  clearAuth: ()            => { setToken(null);  set({ user: null, isLoading: false }); },
  setLoading:(v)           => set({ isLoading: v }),
}));
