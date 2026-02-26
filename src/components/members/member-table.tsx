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
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import type { Member } from '@/types';

interface MemberTableProps {
  members: Member[];
  onDelete: (id: string) => void;
}

export function MemberTable({ members, onDelete }: MemberTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 멤버를 삭제하시겠습니까?`)) return;
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
            <TableHead>나이</TableHead>
            <TableHead>국적</TableHead>
            <TableHead>본당</TableHead>
            <TableHead>성당</TableHead>
            <TableHead>선택 교구</TableHead>
            <TableHead>지역</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead className="w-28">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <Link href={`/members/${member.id}`} className="hover:underline">
                  {member.name}
                </Link>
              </TableCell>
              <TableCell>{member.age ?? '-'}</TableCell>
              <TableCell>{member.nation ?? '-'}</TableCell>
              <TableCell>{member.parish ?? '-'}</TableCell>
              <TableCell>{member.cathedral ?? '-'}</TableCell>
              <TableCell>
                {member.chosenDiocese ? (
                  <Badge variant="secondary">{member.chosenDiocese}</Badge>
                ) : '-'}
              </TableCell>
              <TableCell>{member.region ?? '-'}</TableCell>
              <TableCell className="text-xs">{member.phone ?? '-'}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/members/${member.id}/edit`}>수정</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === member.id}
                    onClick={() => handleDelete(member.id, member.name)}
                  >
                    {deletingId === member.id ? (
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
