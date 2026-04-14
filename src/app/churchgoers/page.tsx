'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChurchgoers, deleteChurchgoer } from '@/lib/api';
import { ChurchgoerTable } from '@/components/churchgoers/churchgoer-table';
import { Spinner } from '@/components/ui/spinner';
import { ChurchgoerFilters } from '@/components/churchgoers/churchgoer-filters';
import { Pagination } from '@/components/members/pagination';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import type { ChurchgoerListResponse, ChurchgoerQuery } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

function ChurchgoersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const pageIndex = Number(searchParams.get('pageIndex') ?? '0');
  const filters: ChurchgoerQuery = {
    name: searchParams.get('name') ?? undefined,
    parish: searchParams.get('parish') ?? undefined,
  };

  function buildParams(overrides: Partial<ChurchgoerQuery & { pageIndex: number }>) {
    const merged = { ...filters, pageIndex, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return params.toString();
  }

  const { data, isLoading, error, refetch } = useQuery<ChurchgoerListResponse>({
    queryKey: ['churchgoers', filters, pageIndex],
    queryFn: () => getChurchgoers({ ...filters, pageIndex, pageSize: DEFAULT_PAGE_SIZE }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChurchgoer,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['churchgoers'] });
      const remaining = (data?.data ?? []).filter((c) => c.id !== deletedId);
      if (remaining.length === 0 && pageIndex > 0) {
        router.push(`/churchgoers?${buildParams({ pageIndex: pageIndex - 1 })}`);
      }
    },
  });

  const handleSearch = useCallback(
    (newFilters: ChurchgoerQuery) => {
      const qs = buildParams({ ...newFilters, pageIndex: 0 });
      const current = searchParams.toString();
      if (qs === current) {
        refetch();
      } else {
        router.push(`/churchgoers?${qs}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filters, searchParams, refetch],
  );

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      router.push(`/churchgoers?${buildParams({ pageIndex: newPageIndex })}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filters],
  );

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">본당 홈스테이 봉사자 관리</h1>
        <Button asChild>
          <Link href="/churchgoers/new">+ 봉사자 등록</Link>
        </Button>
      </div>

      <ChurchgoerFilters onSearch={handleSearch} initialValues={filters} />

      {error && (
        <div className="flex items-center justify-between rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : '오류가 발생했습니다.'}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            새로고침
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !data?.data.length ? (
        <Empty message={hasFilters ? '검색 결과가 없습니다.' : '등록된 봉사자가 없습니다.'} />
      ) : (
        <ChurchgoerTable
          churchgoers={data.data}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination
          pageIndex={data.meta.pageIndex}
          totalCount={data.meta.totalCount}
          pageSize={data.meta.pageSize}
          totalPages={data.meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function ChurchgoersPage() {
  return (
    <Suspense>
      <ChurchgoersContent />
    </Suspense>
  );
}
