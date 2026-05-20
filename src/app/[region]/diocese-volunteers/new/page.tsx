'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createDioceseVolunteer } from '@/lib/api';
import { DioceseVolunteerForm } from '@/components/diocese-volunteers/diocese-volunteer-form';
import type { DioceseVolunteer } from '@/types';

export default function NewDioceseVolunteerPage() {
  const queryClient = useQueryClient();

  async function handleSubmit(data: Partial<DioceseVolunteer>) {
    await createDioceseVolunteer(data);
    await queryClient.invalidateQueries({ queryKey: ['diocese-volunteers'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">교구청 봉사자 등록</h1>
      <DioceseVolunteerForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
