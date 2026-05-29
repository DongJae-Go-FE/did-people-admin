'use client';

import { usePathname } from 'next/navigation';
import type { AudienceCode } from '@/config/dioceses';

// post-login URL 세그먼트 — '/super'는 더 이상 사용하지 않음 (master는 '/all'로 진입)
const VALID_REGIONS = ['incheon', 'jeju', 'suwon', 'all'] as const;

export function isValidRegion(value: string | null | undefined): value is AudienceCode {
  return !!value && (VALID_REGIONS as readonly string[]).includes(value);
}

// URL 첫 세그먼트에서 region 추출: /incheon/members → 'incheon'
export function useCurrentRegion(): AudienceCode | null {
  const pathname = usePathname();
  if (!pathname) return null;
  const seg = pathname.split('/')[1];
  return isValidRegion(seg) ? seg : null;
}
