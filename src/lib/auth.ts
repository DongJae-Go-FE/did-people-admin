import type { User } from '@/types';

const USER_KEY = 'user';
const STORAGE_EVENT = 'user-storage-change';

// 동일 tab 안에서는 localStorage 'storage' 이벤트가 발화하지 않으므로
// 직접 커스텀 이벤트를 띄워 useSyncExternalStore 가 다시 read 하도록 한다.
function notify(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

// JSON 문자열 캐싱 → useSyncExternalStore 가 안정적인 참조를 받도록 한다.
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as User) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notify();
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
  notify();
}

export function subscribeToUser(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
