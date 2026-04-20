'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';
import { getStoredUser, saveUser, clearUser } from '@/lib/auth';

type RequiredRegion = 'incheon' | 'jeju' | 'super';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string, requiredRegion?: RequiredRegion) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // SSR 하이드레이션 일관성을 위해 초기값은 null로 두고 useEffect에서 로컬스토리지 반영.
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const login = useCallback(
    async (username: string, password: string, requiredRegion?: RequiredRegion) => {
      // 로그인 시도 전에 이전 사용자 캐시 완전 제거 → 다른 교구 데이터 누출 방지
      clearUser();
      queryClient.clear();

      const data = await apiLogin(username, password, requiredRegion);
      saveUser(data.user);
      setUser(data.user);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    clearUser();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
