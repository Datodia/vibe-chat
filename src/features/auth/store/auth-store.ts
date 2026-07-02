import { createStore } from 'zustand/vanilla';

import { AuthState, AuthStore } from '@/features/auth/types/auth.types';

export const createAuthStore = (initState: Partial<AuthState> = {}) => {
  const DEFAULT_STATE: AuthState = {
    user: null,
    loading: false,
    error: null,
  };

  return createStore<AuthStore>()((set) => ({
    ...DEFAULT_STATE,
    ...initState,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }));
};
