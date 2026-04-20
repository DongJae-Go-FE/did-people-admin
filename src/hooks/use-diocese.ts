'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  type DioceseConfig,
  getDioceseByCode,
  parseDioceseFromPath,
  resolveDioceseFromUser,
} from '@/config/dioceses';
import { useCurrentRegion } from '@/hooks/use-current-region';

// 로그인 전: URL 경로(/login/incheon 등)로 브랜딩.
// 로그인 후: 슈퍼 관리자는 URL region으로, 일반 매니저는 user.region으로.
export function useDiocese(): DioceseConfig | null {
  const { user } = useAuth();
  const pathname = usePathname();
  const urlRegion = useCurrentRegion();

  if (user) {
    if (user.role === 'admin' && urlRegion) {
      return getDioceseByCode(urlRegion);
    }
    return resolveDioceseFromUser(user);
  }
  return parseDioceseFromPath(pathname);
}
