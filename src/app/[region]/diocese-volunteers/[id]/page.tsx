'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getDioceseVolunteer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { useCurrentRegion } from '@/hooks/use-current-region';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center px-6 py-3">
      <span className="w-40 text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium">
        {value !== undefined && value !== null && value !== '' ? String(value) : <span className="text-gray-300">-</span>}
      </span>
    </div>
  );
}

export default function DioceseVolunteerDetailPage({ params }: DetailPageProps) {
  const { id } = use(params);
  const region = useCurrentRegion();
  const listHref = region ? `/${region}/diocese-volunteers` : '/diocese-volunteers';
  const editHref = region ? `/${region}/diocese-volunteers/${id}/edit` : `/diocese-volunteers/${id}/edit`;

  const { data: v, isLoading, error, refetch } = useQuery({
    queryKey: ['diocese-volunteer', id],
    queryFn: () => getDioceseVolunteer(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !v) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">교구청 봉사자 상세</h1>
          <div className="flex gap-2">
            {error && <Button variant="outline" onClick={() => refetch()}>새로고침</Button>}
            <Button variant="outline" asChild>
              <Link href={listHref}>목록</Link>
            </Button>
          </div>
        </div>
        <Empty message={error instanceof Error ? error.message : '데이터를 찾을 수 없습니다.'} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">교구청 봉사자 상세</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={listHref}>목록</Link>
          </Button>
          <Button asChild>
            <Link href={editHref}>수정</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">기본 정보</h2>
        </div>
        <div className="divide-y">
          <Field label="이름" value={v.name} />
          <Field label="세례명" value={v.baptismalName} />
          <Field label="나이" value={v.age} />
          <Field label="이메일" value={v.email} />
          <Field label="주소" value={v.address} />
          <Field label="지역(교구)" value={v.region === 'incheon' ? '인천교구' : v.region === 'jeju' ? '제주교구' : v.region} />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">봉사 정보</h2>
        </div>
        <div className="divide-y">
          <div className="flex items-center px-6 py-3">
            <span className="w-40 text-sm text-gray-500 shrink-0">가능한 봉사</span>
            {v.possibleServices && v.possibleServices.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {v.possibleServices.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-300">-</span>
            )}
          </div>
          <div className="flex items-center px-6 py-3">
            <span className="w-40 text-sm text-gray-500 shrink-0">현재 봉사 여부</span>
            {v.isActive ? (
              <Badge variant="default">활동중</Badge>
            ) : (
              <Badge variant="secondary">비활동</Badge>
            )}
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 mb-2">봉사 의향</p>
            <p className="text-sm whitespace-pre-wrap">
              {v.intention || <span className="text-gray-300">-</span>}
            </p>
          </div>
        </div>
      </div>

      {v.notes && (
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-3">
            <h2 className="text-sm font-semibold text-gray-700">특이사항</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm whitespace-pre-wrap">{v.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
