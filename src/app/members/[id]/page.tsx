'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMember } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberDetailSkeleton } from '@/components/members/member-detail-skeleton';
import { Empty } from '@/components/ui/empty';
import { MemberQr } from '@/components/members/member-qr';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

const FIELD_LABELS: { key: string; label: string }[] = [
  { key: 'name', label: '이름' },
  { key: 'age', label: '나이' },
  { key: 'nation', label: '국적' },
  { key: 'parish', label: '본당' },
  { key: 'cathedral', label: '성당' },
  { key: 'chosenDiocese', label: '선택 교구' },
  { key: 'region', label: '지역' },
  { key: 'phone', label: '연락처' },
  { key: 'emergencyNum', label: '비상 연락처' },
];

export default function MemberDetailPage({ params }: DetailPageProps) {
  const { id } = use(params);

  const { data: member, isLoading, error, refetch } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id),
  });

  if (isLoading) return <MemberDetailSkeleton />;

  if (error || !member) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">멤버 상세</h1>
          <div className="flex gap-2">
            {error && <Button variant="outline" onClick={() => refetch()}>새로고침</Button>}
            <Button variant="outline" asChild>
              <Link href="/members">목록</Link>
            </Button>
          </div>
        </div>
        <Empty message={error instanceof Error ? error.message : '멤버를 찾을 수 없습니다.'} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">멤버 상세</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/members">목록</Link>
          </Button>
          <Button asChild>
            <Link href={`/members/${id}/edit`}>수정</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white divide-y">
        {FIELD_LABELS.map(({ key, label }) => {
          const value = member[key as keyof typeof member];
          return (
            <div key={key} className="flex items-center px-6 py-3">
              <span className="w-32 text-sm text-gray-500 shrink-0">{label}</span>
              <span className="text-sm font-medium">
                {key === 'chosenDiocese' && value ? (
                  <Badge variant="secondary">{String(value)}</Badge>
                ) : value !== undefined && value !== null && value !== '' ? (
                  String(value)
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </span>
            </div>
          );
        })}
        {member.profile && (
          <div className="flex items-start px-6 py-3">
            <span className="w-32 text-sm text-gray-500 shrink-0">프로필 이미지</span>
            <img src={member.profile} alt="프로필" className="h-24 w-24 rounded-md object-cover" />
          </div>
        )}
        {member.qr && (
          <div className="flex items-start px-6 py-3">
            <span className="w-32 text-sm text-gray-500 shrink-0">QR 코드</span>
            <img src={member.qr} alt="QR" className="h-24 w-24 object-contain" />
          </div>
        )}
      </div>

      <MemberQr memberId={id} />
    </div>
  );
}
