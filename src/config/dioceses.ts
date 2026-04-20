export type DioceseCode = 'incheon' | 'jeju';
export type AudienceCode = DioceseCode | 'super';

export interface DioceseConfig {
  code: AudienceCode;
  name: string;
  shortName: string;
  adminTitle: string;
  loginSubtitle: string;
  primaryColor: string;
  logoPath?: string;
}

export const DIOCESES: Record<DioceseCode, DioceseConfig> = {
  incheon: {
    code: 'incheon',
    name: '인천교구',
    shortName: '인천',
    adminTitle: 'DID DB Admin · 인천교구',
    loginSubtitle: '인천교구 관리자 로그인',
    primaryColor: '#1d4ed8',
  },
  jeju: {
    code: 'jeju',
    name: '제주교구',
    shortName: '제주',
    adminTitle: 'DID DB Admin · 제주교구',
    loginSubtitle: '제주교구 관리자 로그인',
    primaryColor: '#ea580c',
  },
};

export const SUPER_CONFIG: DioceseConfig = {
  code: 'super',
  name: '전체 교구',
  shortName: '슈퍼',
  adminTitle: 'DID DB Admin · 슈퍼 관리자',
  loginSubtitle: '슈퍼 관리자 로그인',
  primaryColor: '#111827',
};

export function getDioceseByCode(code: string | null | undefined): DioceseConfig | null {
  if (!code) return null;
  if (code === 'super') return SUPER_CONFIG;
  if (code in DIOCESES) return DIOCESES[code as DioceseCode];
  return null;
}

// 로그인 URL에서 diocese 추출: /login/incheon → incheon
export function parseDioceseFromPath(pathname: string | null | undefined): DioceseConfig | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/login\/([^/]+)/);
  if (!match) return null;
  return getDioceseByCode(match[1]);
}

// 사용자 JWT region으로 diocese 해석. region이 null/undefined면 super.
export function resolveDioceseFromUser(
  user: { region?: string | null } | null,
): DioceseConfig | null {
  if (!user) return null;
  if (!user.region) return SUPER_CONFIG;
  return getDioceseByCode(user.region);
}
