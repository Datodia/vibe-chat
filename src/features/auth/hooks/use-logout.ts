'use client';
import { signOut } from 'next-auth/react';

import { useAuthStore } from './useAuthStore';

export const useLogout = () => {
  const { setUser } = useAuthStore();
  const logout = async () => {
    setUser(null);
    await signOut({ callbackUrl: '/' });
  };
  return { logout };
};
