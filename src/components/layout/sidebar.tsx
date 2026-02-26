'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const navItems = [
    { href: '/members', label: '멤버 관리' },
  ];

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold">DID DB Admin</span>
      </div>

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
            <p>{user.role === 'admin' ? '관리자' : '매니저'}{user.region ? ` · ${user.region}` : ''}</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
