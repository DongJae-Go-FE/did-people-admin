'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Churchgoer } from '@/types';

interface ChurchgoerTableProps {
  churchgoers: Churchgoer[];
  onDelete: (id: string) => void;
}

function BoolIcon({ value }: { value?: boolean }) {
  return value ? (
    <span className="text-green-600 font-bold">&#10003;</span>
  ) : (
    <span className="text-gray-300">&mdash;</span>
  );
}

export function ChurchgoerTable({ churchgoers, onDelete }: ChurchgoerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name?: string) {
    if (!confirm(`"${name ?? id}" 본당 인원을 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    try {
      await onDelete(id);
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
            <TableHead>본당</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead className="text-center">아침</TableHead>
            <TableHead className="text-center">점심</TableHead>
            <TableHead className="text-center">저녁</TableHead>
            <TableHead className="text-center">홈스테이</TableHead>
            <TableHead className="text-center">수용 인원</TableHead>
            <TableHead className="w-28">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {churchgoers.map((cg) => (
            <TableRow key={cg.id}>
              <TableCell className="font-medium">
                <Link href={`/churchgoers/${cg.id}`} className="hover:underline">
                  {cg.name ?? '-'}
                </Link>
              </TableCell>
              <TableCell>{cg.baptismalName ?? '-'}</TableCell>
              <TableCell>{cg.parish ?? '-'}</TableCell>
              <TableCell className="text-xs">{cg.phone ?? '-'}</TableCell>
              <TableCell className="text-center"><BoolIcon value={cg.breakfastAvailable} /></TableCell>
              <TableCell className="text-center"><BoolIcon value={cg.lunchAvailable} /></TableCell>
              <TableCell className="text-center"><BoolIcon value={cg.dinnerAvailable} /></TableCell>
              <TableCell className="text-center"><BoolIcon value={cg.homestayAvailable} /></TableCell>
              <TableCell className="text-center">{cg.maxCapacity ?? '-'}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/churchgoers/${cg.id}/edit`}>수정</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === cg.id}
                    onClick={() => handleDelete(cg.id, cg.name)}
                  >
                    {deletingId === cg.id ? (
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
