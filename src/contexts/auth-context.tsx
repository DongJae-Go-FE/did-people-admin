'use client';

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';
import { getStoredUser, saveUser, clearUser, subscribeToUser } from '@/lib/auth';

type RequiredRegion = 'incheon' | 'jeju' | 'suwon' | 'super';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string, requiredRegion?: RequiredRegion) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (next: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// SSR snapshot — 서버에서는 항상 null 로 시작 (하이드레이션 일관성)
const getServerSnapshot = (): User | null => null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // localStorage 를 외부 store 로 취급. setState-in-effect 패턴 회피.
  const user = useSyncExternalStore(subscribeToUser, getStoredUser, getServerSnapshot);

  const login = useCallback(
    async (username: string, password: string, requiredRegion?: RequiredRegion) => {
      clearUser();
      queryClient.clear();
      const data = await apiLogin(username, password, requiredRegion);
      saveUser(data.user);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    clearUser();
    queryClient.clear();
  }, [queryClient]);

  const updateUser = useCallback((next: User) => {
    saveUser(next);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
