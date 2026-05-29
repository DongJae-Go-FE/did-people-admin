'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCurrentRegion } from '@/hooks/use-current-region';
import type { DioceseVolunteer } from '@/types';

interface DioceseVolunteerTableProps {
  volunteers: DioceseVolunteer[];
  onDelete: (id: string) => void;
}

export function DioceseVolunteerTable({ volunteers, onDelete }: DioceseVolunteerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const region = useCurrentRegion();
  const base = region ? `/${region}` : '';
  const router = useRouter();

  async function handleDelete(id: string, name?: string) {
    if (!confirm(`"${name ?? id}" 봉사자를 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch {
      // 에러는 상위 mutation에서 처리 — 여기선 버튼 상태만 복구
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>세례명</TableHead>
            <TableHead className="text-center">나이</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>가능한 봉사</TableHead>
            <TableHead className="text-center">현재 봉사</TableHead>
            <TableHead className="w-28">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volunteers.map((v) => (
            <TableRow
              key={v.id}
              onClick={() => router.push(`${base}/diocese-volunteers/${v.id}`)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium">{v.name ?? '-'}</TableCell>
              <TableCell>{v.baptismalName ?? '-'}</TableCell>
              <TableCell className="text-center">{v.age ?? '-'}</TableCell>
              <TableCell className="text-xs">{v.email ?? '-'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(v.possibleServices ?? []).slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                  {(v.possibleServices?.length ?? 0) > 4 && (
                    <Badge variant="outline" className="text-xs">+{(v.possibleServices!.length - 4)}</Badge>
                  )}
                  {(!v.possibleServices || v.possibleServices.length === 0) && (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {v.isActive ? (
                  <Badge variant="default">활동</Badge>
                ) : (
                  <Badge variant="secondary">비활동</Badge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`${base}/diocese-volunteers/${v.id}/edit`}>수정</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === v.id}
                    onClick={() => handleDelete(v.id, v.name)}
                  >
                    {deletingId === v.id ? (
                      <Spinner size="sm" className="border-white border-t-transparent" />
                    ) : '삭제'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
