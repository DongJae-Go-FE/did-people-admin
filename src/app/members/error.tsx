'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MembersError({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-gray-200">오류</p>
      <h1 className="text-lg font-semibold text-gray-700">페이지를 불러오지 못했습니다.</h1>
      <p className="text-sm text-gray-400">
        {error.message || '예기치 않은 오류가 발생했습니다.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>
          새로고침
        </Button>
        <Button variant="outline" onClick={() => router.push('/members')}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
