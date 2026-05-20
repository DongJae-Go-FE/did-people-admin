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

    // 최초 로그인이면 비밀번호 변경 강제
    if (user.isFirstLogin) {
      router.replace('/change-password');
      return;
    }

    // 사용자의 home region 계산
    // - master: '/all'
    // - admin/manager: 본인 region
    const homeRegion = user.role === 'master' ? 'all' : (user.region ?? 'incheon');

    // 유효하지 않은 region → 본인 home으로
    if (!isValidRegion(region)) {
      router.replace(`/${homeRegion}/members`);
      return;
    }

    // master가 아닌데 URL region이 본인 region과 다르면 본인 region으로
    if (user.role !== 'master' && region !== user.region) {
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
