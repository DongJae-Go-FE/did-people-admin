'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChurchgoer, unassignMember } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { MemberAssignDialog } from '@/components/churchgoers/member-assign-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

export default function ChurchgoerDetailPage({ params }: DetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: cg, isLoading, error, refetch } = useQuery({
    queryKey: ['churchgoer', id],
    queryFn: () => getChurchgoer(id),
  });

  const unassignMutation = useMutation({
    mutationFn: (memberId: number) => unassignMember(id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churchgoer', id] });
      queryClient.invalidateQueries({ queryKey: ['churchgoers'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
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
          <h1 className="text-2xl font-bold">봉사자 상세</h1>
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

  const familyTypeDisplay = cg.familyType === '부부+자녀' && cg.childrenCount
    ? `${cg.familyType} (자녀 ${cg.childrenCount}명)`
    : cg.familyType === '기타' && cg.familyTypeOther
      ? `기타: ${cg.familyTypeOther}`
      : cg.familyType;

  const housingTypeDisplay = cg.housingType === '기타' && cg.housingTypeOther
    ? `기타: ${cg.housingTypeOther}`
    : cg.housingType;

  const petDisplay = cg.hasPet
    ? [cg.petType, cg.petLocation ? `(${cg.petLocation})` : ''].filter(Boolean).join(' ') || '있음'
    : '없음';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">봉사자 상세</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/churchgoers">목록</Link>
          </Button>
          <Button asChild>
            <Link href={`/churchgoers/${id}/edit`}>수정</Link>
          </Button>
        </div>
      </div>

      {/* 섹션 1: 봉사자 기본 정보 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">봉사자 기본 정보</h2>
        </div>
        <div className="divide-y">
          <Field label="구역" value={cg.district} />
          <Field label="반" value={cg.ban} />
          <Field label="가구주 성명" value={cg.name} />
          <Field label="세례명" value={cg.baptismalName} />
          <Field label="연락처" value={cg.phone} />
          <Field label="도로명 주소" value={cg.address} />
          <Field label="본당" value={cg.parish} />
          <Field label="가족 구성원" value={familyTypeDisplay} />
          <Field label="주거 형태" value={housingTypeDisplay} />
          <Field label="방 개수" value={cg.availableRooms} />
        </div>
      </div>

      {/* 섹션 2: 숙박 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">숙박</h2>
        </div>
        <div className="divide-y">
          <Field label="순례자 성별 선호" value={cg.pilgrimGender} />
          <Field label="수용 가능 인원" value={cg.maxCapacity} />
          <div className="flex items-center px-6 py-3">
            <span className="w-40 text-sm text-gray-500 shrink-0">성직자/수도자 수용</span>
            <BoolBadge value={cg.clergyAcceptable} label="수용" />
          </div>
          <Field label="침실 제공" value={cg.bedroomType} />
          <Field label="침대 수" value={cg.bedCount} />
          <Field label="온돌/이불 세트" value={cg.futonCount} />
          <Field label="욕실 사용" value={cg.bathroomType} />
          <Field label="반려동물" value={petDisplay} />
          <div className="flex items-center px-6 py-3">
            <span className="w-40 text-sm text-gray-500 shrink-0">편의시설</span>
            <div className="flex gap-2">
              <BoolBadge value={cg.hasWifi} label="Wi-Fi" />
              <BoolBadge value={cg.hasWasher} label="세탁기" />
            </div>
          </div>
        </div>
      </div>

      {/* 섹션 3: 식사 및 흡연 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">식사 및 흡연</h2>
        </div>
        <div className="divide-y">
          <div className="flex items-center px-6 py-3">
            <span className="w-40 text-sm text-gray-500 shrink-0">식사 제공</span>
            <div className="flex gap-2">
              <BoolBadge value={cg.breakfastAvailable} label="아침" />
              <BoolBadge value={cg.dinnerAvailable} label="저녁" />
            </div>
          </div>
          <Field label="흡연 정책" value={cg.smokingPolicy} />
        </div>
      </div>

      {/* 섹션 4: 이동 지원 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">이동 지원</h2>
        </div>
        <div className="divide-y">
          <Field label="교통수단" value={cg.transportationType} />
        </div>
      </div>

      {/* 비고 */}
      {cg.notes && (
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-3">
            <h2 className="text-sm font-semibold text-gray-700">비고</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm whitespace-pre-wrap">{cg.notes}</p>
          </div>
        </div>
      )}

      {/* 섹션 5: 배정된 참여인원 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">배정된 참여인원</h2>
          <Button size="sm" onClick={() => setAssignOpen(true)}>+ 배정</Button>
        </div>
        {cg.assignedMembers && cg.assignedMembers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>나이</TableHead>
                <TableHead>국적</TableHead>
                <TableHead>본당</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead className="w-20">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cg.assignedMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <Link href={`/members/${m.id}`} className="hover:underline">
                      {m.name ?? '-'}
                    </Link>
                  </TableCell>
                  <TableCell>{m.age ?? '-'}</TableCell>
                  <TableCell>{m.nation ?? '-'}</TableCell>
                  <TableCell>{m.parish ?? '-'}</TableCell>
                  <TableCell className="text-xs">{m.phone ?? '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={unassignMutation.isPending}
                      onClick={() => {
                        if (confirm(`"${m.name}" 배정을 해제하시겠습니까?`)) {
                          unassignMutation.mutate(m.id);
                        }
                      }}
                    >
                      해제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-400">배정된 참여인원이 없습니다.</div>
        )}
      </div>

      <MemberAssignDialog churchgoerId={id} open={assignOpen} onOpenChange={setAssignOpen} />
    </div>
  );
}
