'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace('/login');
      return;
    }
    const region = stored.role === 'master' ? 'all' : (stored.region ?? 'incheon');
    router.replace(`/${region}/members`);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}
