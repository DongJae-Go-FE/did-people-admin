'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
      <p className="text-8xl font-bold text-gray-200">500</p>
      <h1 className="text-xl font-semibold text-gray-700">오류가 발생했습니다.</h1>
      <p className="text-sm text-gray-400">
        {error.message || '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>다시 시도</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/members')}>
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
