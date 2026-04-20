'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useDiocese } from '@/hooks/use-diocese';
import { useCurrentRegion } from '@/hooks/use-current-region';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DIOCESES } from '@/config/dioceses';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const diocese = useDiocese();
  const region = useCurrentRegion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const regionPrefix = region ? `/${region}` : '';
  const navItems = [
    { href: `${regionPrefix}/members`, label: '본당 DID 참여인원 관리' },
    { href: `${regionPrefix}/churchgoers`, label: '본당 홈스테이 봉사자 관리' },
  ];

  const isSuperAdmin = user?.role === 'admin';
  const switcherOptions = [
    { code: 'incheon', name: DIOCESES.incheon.name },
    { code: 'jeju', name: DIOCESES.jeju.name },
    { code: 'super', name: '전체 교구' },
  ];

  function handleRegionChange(next: string) {
    if (!region) return;
    // 현재 경로에서 region 세그먼트만 교체
    const rest = pathname?.replace(/^\/[^/]+/, '') ?? '/members';
    router.push(`/${next}${rest || '/members'}`);
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white">
      <div className="flex h-16 flex-col justify-center border-b px-6">
        <span className="text-lg font-bold">DID DB Admin</span>
        {mounted && diocese && <span className="text-xs text-gray-500">{diocese.name}</span>}
      </div>

      {mounted && isSuperAdmin && region && (
        <div className="border-b px-4 py-3">
          <label className="block text-xs text-gray-500 mb-1">지역 전환</label>
          <Select value={region} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {switcherOptions.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>{opt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        {mounted && user && (
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700 truncate">{user.email}</p>
            <p>{user.role === 'admin' ? '관리자' : '매니저'}{diocese ? ` · ${diocese.name}` : ''}</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
