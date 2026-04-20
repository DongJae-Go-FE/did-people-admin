'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { isValidRegion } from '@/hooks/use-current-region';

interface RegionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ region: string }>;
}

export default function RegionLayout({ children, params }: RegionLayoutProps) {
  const { region } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // 사용자의 home region 계산 (super는 기본 'incheon')
    const homeRegion = user.role === 'admin' ? 'super' : (user.region ?? 'incheon');

    // 유효하지 않은 region → 본인 region으로 리다이렉트
    if (!isValidRegion(region)) {
      router.replace(`/${homeRegion}/members`);
      return;
    }

    // 일반 매니저가 타 지역 URL 접근 → 본인 region으로 리다이렉트
    if (user.role !== 'admin' && region !== user.region) {
      router.replace(`/${homeRegion}/members`);
    }
  }, [user, region, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
