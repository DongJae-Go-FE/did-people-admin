'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMember, updateMember } from '@/lib/api';
import { MemberForm } from '@/components/members/member-form';
import { MemberFormSkeleton } from '@/components/members/member-form-skeleton';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import type { Member } from '@/types';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemberPage({ params }: EditPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: member, isLoading, error, refetch } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id),
  });

  async function handleSubmit(data: Partial<Member>) {
    await updateMember(id, data);
    await queryClient.invalidateQueries({ queryKey: ['members'] });
    await queryClient.invalidateQueries({ queryKey: ['member', id] });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">멤버 수정</h1>
        <MemberFormSkeleton />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">멤버 수정</h1>
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
      <h1 className="text-2xl font-bold">멤버 수정</h1>
      <MemberForm mode="edit" initialData={member} onSubmit={handleSubmit} />
    </div>
  );
}
