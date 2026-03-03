'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getChurchgoer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

function BoolBadge({ value, label }: { value?: boolean; label: string }) {
  return (
    <Badge variant={value ? 'default' : 'secondary'}>
      {label}: {value ? '가능' : '불가'}
    </Badge>
  );
}

export default function ChurchgoerDetailPage({ params }: DetailPageProps) {
  const { id } = use(params);

  const { data: cg, isLoading, error, refetch } = useQuery({
    queryKey: ['churchgoer', id],
    queryFn: () => getChurchgoer(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !cg) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">본당 인원 상세</h1>
          <div className="flex gap-2">
            {error && <Button variant="outline" onClick={() => refetch()}>새로고침</Button>}
            <Button variant="outline" asChild>
              <Link href="/churchgoers">목록</Link>
            </Button>
          </div>
        </div>
        <Empty message={error instanceof Error ? error.message : '데이터를 찾을 수 없습니다.'} />
      </div>
    );
  }

  const basicFields = [
    { label: '이름', value: cg.name },
    { label: '세례명', value: cg.baptismalName },
    { label: '연락처', value: cg.phone },
    { label: '주소', value: cg.address },
    { label: '본당', value: cg.parish },
  ];

  const stayFields = [
    { label: '가능 날짜', value: cg.homestayDates },
    { label: '방 수', value: cg.availableRooms },
    { label: '수용 인원', value: cg.maxCapacity },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">본당 인원 상세</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/churchgoers">목록</Link>
          </Button>
          <Button asChild>
            <Link href={`/churchgoers/${id}/edit`}>수정</Link>
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">기본 정보</h2>
        </div>
        <div className="divide-y">
          {basicFields.map(({ label, value }) => (
            <div key={label} className="flex items-center px-6 py-3">
              <span className="w-32 text-sm text-gray-500 shrink-0">{label}</span>
              <span className="text-sm font-medium">
                {value !== undefined && value !== null && value !== '' ? String(value) : <span className="text-gray-300">-</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 식사 제공 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">식사 제공</h2>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-4">
          <BoolBadge value={cg.breakfastAvailable} label="아침" />
          <BoolBadge value={cg.lunchAvailable} label="점심" />
          <BoolBadge value={cg.dinnerAvailable} label="저녁" />
          <BoolBadge value={cg.mealOnlyAvailable} label="식사만" />
        </div>
      </div>

      {/* 숙박 정보 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">숙박 정보</h2>
        </div>
        <div className="divide-y">
          <div className="flex items-center px-6 py-3">
            <span className="w-32 text-sm text-gray-500 shrink-0">홈스테이</span>
            <Badge variant={cg.homestayAvailable ? 'default' : 'secondary'}>
              {cg.homestayAvailable ? '가능' : '불가'}
            </Badge>
          </div>
          {stayFields.map(({ label, value }) => (
            <div key={label} className="flex items-center px-6 py-3">
              <span className="w-32 text-sm text-gray-500 shrink-0">{label}</span>
              <span className="text-sm font-medium">
                {value !== undefined && value !== null && value !== '' ? String(value) : <span className="text-gray-300">-</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 기타 */}
      {cg.notes && (
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-3">
            <h2 className="text-sm font-semibold text-gray-700">기타</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm whitespace-pre-wrap">{cg.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
