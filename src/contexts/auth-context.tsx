'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '@/types';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';
import { getStoredUser, saveUser, clearUser } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    // 토큰은 Route Handler가 HttpOnly 쿠키로 저장 — 여기선 user 정보만 보관
    saveUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    clearUser();
    setUser(null);
  }, []);

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
