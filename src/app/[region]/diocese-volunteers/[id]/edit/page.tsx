'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDioceseVolunteer, updateDioceseVolunteer } from '@/lib/api';
import { DioceseVolunteerForm } from '@/components/diocese-volunteers/diocese-volunteer-form';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { useCurrentRegion } from '@/hooks/use-current-region';
import type { DioceseVolunteer } from '@/types';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditDioceseVolunteerPage({ params }: EditPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const region = useCurrentRegion();
  const listHref = region ? `/${region}/diocese-volunteers` : '/diocese-volunteers';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['diocese-volunteer', id],
    queryFn: () => getDioceseVolunteer(id),
  });

  async function handleSubmit(values: Partial<DioceseVolunteer>) {
    await updateDioceseVolunteer(id, values);
    await queryClient.invalidateQueries({ queryKey: ['diocese-volunteers'] });
    await queryClient.invalidateQueries({ queryKey: ['diocese-volunteer', id] });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">교구청 봉사자 수정</h1>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">교구청 봉사자 수정</h1>
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
      <h1 className="text-2xl font-bold">교구청 봉사자 수정</h1>
      <DioceseVolunteerForm mode="edit" initialData={data} onSubmit={handleSubmit} />
    </div>
  );
}
