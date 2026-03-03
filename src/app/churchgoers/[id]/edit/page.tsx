'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChurchgoer, updateChurchgoer } from '@/lib/api';
import { ChurchgoerForm } from '@/components/churchgoers/churchgoer-form';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import type { Churchgoer } from '@/types';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditChurchgoerPage({ params }: EditPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: cg, isLoading, error, refetch } = useQuery({
    queryKey: ['churchgoer', id],
    queryFn: () => getChurchgoer(id),
  });

  async function handleSubmit(data: Partial<Churchgoer>) {
    await updateChurchgoer(id, data);
    await queryClient.invalidateQueries({ queryKey: ['churchgoers'] });
    await queryClient.invalidateQueries({ queryKey: ['churchgoer', id] });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">본당 인원 수정</h1>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !cg) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">본당 인원 수정</h1>
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">본당 인원 수정</h1>
      <ChurchgoerForm mode="edit" initialData={cg} onSubmit={handleSubmit} />
    </div>
  );
}
