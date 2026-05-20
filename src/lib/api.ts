import { clearUser } from './auth';
import type {
  AssignedMemberSummary,
  Churchgoer,
  ChurchgoerListResponse,
  ChurchgoerQuery,
  DioceseVolunteer,
  DioceseVolunteerListResponse,
  DioceseVolunteerQuery,
  LoginResponse,
  Member,
  MemberListResponse,
  MemberQuery,
} from '@/types';

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
export async function login(
  username: string,
  password: string,
  requiredRegion?: 'incheon' | 'jeju' | 'super',
): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, requiredRegion }),
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

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const res = await fetchWithAuth('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '비밀번호 변경에 실패했습니다.');
  }
  return res.json();
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

export async function getMemberParishes(region?: string): Promise<string[]> {
  const qs = region ? `?region=${encodeURIComponent(region)}` : '';
  const res = await fetchWithAuth(`/members/parishes${qs}`);
  if (!res.ok) throw new Error('본당 목록을 불러오지 못했습니다.');
  return res.json();
}

// Churchgoers API
export async function getChurchgoers(query: ChurchgoerQuery = {}): Promise<ChurchgoerListResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.append(k, String(v));
  });
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchWithAuth(`/churchgoers${qs}`);
  if (!res.ok) throw new Error('봉사자 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function getChurchgoer(id: string): Promise<Churchgoer> {
  const res = await fetchWithAuth(`/churchgoers/${id}`);
  if (!res.ok) throw new Error('봉사자를 불러오지 못했습니다.');
  return res.json();
}

export async function createChurchgoer(data: Partial<Churchgoer>): Promise<Churchgoer> {
  const res = await fetchWithAuth('/churchgoers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '봉사자 등록에 실패했습니다.');
  }
  return res.json();
}

export async function updateChurchgoer(id: string, data: Partial<Churchgoer>): Promise<Churchgoer> {
  const res = await fetchWithAuth(`/churchgoers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '봉사자 수정에 실패했습니다.');
  }
  return res.json();
}

export async function deleteChurchgoer(id: string): Promise<void> {
  const res = await fetchWithAuth(`/churchgoers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('봉사자 삭제에 실패했습니다.');
}

export async function getChurchgoerParishes(region?: string): Promise<string[]> {
  const qs = region ? `?region=${encodeURIComponent(region)}` : '';
  const res = await fetchWithAuth(`/churchgoers/parishes${qs}`);
  if (!res.ok) throw new Error('본당 목록을 불러오지 못했습니다.');
  return res.json();
}

// Assignment API
export async function assignMembers(churchgoerId: string, memberIds: number[]): Promise<Churchgoer> {
  const res = await fetchWithAuth(`/churchgoers/${churchgoerId}/assignments`, {
    method: 'POST',
    body: JSON.stringify({ memberIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '배정에 실패했습니다.');
  }
  return res.json();
}

export async function unassignMember(churchgoerId: string, memberId: number): Promise<void> {
  const res = await fetchWithAuth(`/churchgoers/${churchgoerId}/assignments/${memberId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('배정 해제에 실패했습니다.');
}

export async function getAssignedMembers(churchgoerId: string): Promise<AssignedMemberSummary[]> {
  const res = await fetchWithAuth(`/churchgoers/${churchgoerId}/assignments`);
  if (!res.ok) throw new Error('배정 멤버 목록을 불러오지 못했습니다.');
  return res.json();
}

// Diocese Volunteers API (교구청 봉사자)
export async function getDioceseVolunteers(
  query: DioceseVolunteerQuery = {},
): Promise<DioceseVolunteerListResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.append(k, String(v));
  });
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchWithAuth(`/diocese-volunteers${qs}`);
  if (!res.ok) throw new Error('교구청 봉사자 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function getDioceseVolunteer(id: string): Promise<DioceseVolunteer> {
  const res = await fetchWithAuth(`/diocese-volunteers/${id}`);
  if (!res.ok) throw new Error('교구청 봉사자를 불러오지 못했습니다.');
  return res.json();
}

export async function createDioceseVolunteer(
  data: Partial<DioceseVolunteer>,
): Promise<DioceseVolunteer> {
  const res = await fetchWithAuth('/diocese-volunteers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '교구청 봉사자 등록에 실패했습니다.');
  }
  return res.json();
}

export async function updateDioceseVolunteer(
  id: string,
  data: Partial<DioceseVolunteer>,
): Promise<DioceseVolunteer> {
  const res = await fetchWithAuth(`/diocese-volunteers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '교구청 봉사자 수정에 실패했습니다.');
  }
  return res.json();
}

export async function deleteDioceseVolunteer(id: string): Promise<void> {
  const res = await fetchWithAuth(`/diocese-volunteers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('교구청 봉사자 삭제에 실패했습니다.');
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
