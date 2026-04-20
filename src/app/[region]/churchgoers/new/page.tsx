'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createChurchgoer } from '@/lib/api';
import { ChurchgoerForm } from '@/components/churchgoers/churchgoer-form';
import type { Churchgoer } from '@/types';

export default function NewChurchgoerPage() {
  const queryClient = useQueryClient();

  async function handleSubmit(data: Partial<Churchgoer>) {
    await createChurchgoer(data);
    await queryClient.invalidateQueries({ queryKey: ['churchgoers'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">봉사자 등록</h1>
      <ChurchgoerForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
