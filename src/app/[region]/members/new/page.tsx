'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createMember } from '@/lib/api';
import { MemberForm } from '@/components/members/member-form';
import type { Member } from '@/types';

export default function NewMemberPage() {
  const queryClient = useQueryClient();

  async function handleSubmit(data: Partial<Member>) {
    await createMember(data);
    await queryClient.invalidateQueries({ queryKey: ['members'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">멤버 등록</h1>
      <MemberForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
