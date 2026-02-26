import { clearUser } from './auth';
import type { LoginResponse, Member, MemberListResponse, MemberQuery } from '@/types';

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onTokenRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch('/api/auth/refresh', { method: 'POST' });
  if (!res.ok) {
    clearUser();
    return false;
  }
  return true;
}

// 모든 API 호출은 /api/proxy를 통해 서버 사이드에서 accessToken 주입
async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });

  if (res.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push(() => {
          resolve(fetchWithAuth(path, options, false));
        });
      });
    }

    isRefreshing = true;
    const ok = await refreshAccessToken();
    isRefreshing = false;

    if (!ok) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return res;
    }

    onTokenRefreshed();
    return fetchWithAuth(path, options, false);
  }

  return res;
}

// Auth — Route Handler 경유 (HttpOnly 쿠키 Set-Cookie)
export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '로그인에 실패했습니다.');
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
  clearUser();
}

// Members API
export async function getMembers(query: MemberQuery = {}): Promise<MemberListResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.append(k, String(v));
  });
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchWithAuth(`/members${qs}`);
  if (!res.ok) throw new Error('멤버 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function getMember(id: string): Promise<Member> {
  const res = await fetchWithAuth(`/members/${id}`);
  if (!res.ok) throw new Error('멤버를 불러오지 못했습니다.');
  return res.json();
}

export async function createMember(data: Partial<Member>): Promise<Member> {
  const res = await fetchWithAuth('/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '멤버 등록에 실패했습니다.');
  }
  return res.json();
}

export async function updateMember(id: string, data: Partial<Member>): Promise<Member> {
  const res = await fetchWithAuth(`/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '멤버 수정에 실패했습니다.');
  }
  return res.json();
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetchWithAuth(`/members/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('멤버 삭제에 실패했습니다.');
}

export async function exportMembersExcel(filters: MemberQuery = {}): Promise<void> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/members/export${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error('내보내기에 실패했습니다.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `members-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
