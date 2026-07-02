'use client';
import { createContext, useContext } from 'react';
import { useStore, StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { AuthStore, AuthStoreType } from '@/features/auth/types/auth.types';

export const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(null);

export const useAuthStore = () => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error('useAuthStore must be used within StoreProvider');
  return useStore(
    store,
    useShallow((state: AuthStoreType) => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      setUser: state.setUser,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );
};
