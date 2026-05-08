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
// 로그인 후: master는 user.region('all'/null) 기준, 그 외는 user.region 기준.
export function useDiocese(): DioceseConfig | null {
  const { user } = useAuth();
  const pathname = usePathname();
  const urlRegion = useCurrentRegion();

  if (user) {
    return resolveDioceseFromUser(user);
  }
  return parseDioceseFromPath(pathname) ?? (urlRegion ? getDioceseByCode(urlRegion) : null);
}
