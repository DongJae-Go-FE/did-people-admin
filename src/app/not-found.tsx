import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
      <p className="text-8xl font-bold text-gray-200">404</p>
      <h1 className="text-xl font-semibold text-gray-700">페이지를 찾을 수 없습니다.</h1>
      <p className="text-sm text-gray-400">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Button asChild variant="outline">
        <Link href="/members">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
