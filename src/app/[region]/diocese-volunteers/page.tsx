'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDioceseVolunteers, deleteDioceseVolunteer } from '@/lib/api';
import { DioceseVolunteerTable } from '@/components/diocese-volunteers/diocese-volunteer-table';
import { DioceseVolunteerFilters } from '@/components/diocese-volunteers/diocese-volunteer-filters';
import { Spinner } from '@/components/ui/spinner';
import { Pagination } from '@/components/members/pagination';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentRegion } from '@/hooks/use-current-region';
import type { DioceseVolunteerListResponse, DioceseVolunteerQuery } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

function DioceseVolunteersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const region = useCurrentRegion();
  const { user } = useAuth();
  const basePath = region ? `/${region}/diocese-volunteers` : '/diocese-volunteers';

  // 권한 가드: manager 는 본인 region home 으로 강제 이동
  useEffect(() => {
    if (!user) return;
    if (user.role === 'manager') {
      const home = `/${user.region ?? 'incheon'}/members`;
      router.replace(home);
    }
  }, [user, router]);

  const pageIndex = Number(searchParams.get('pageIndex') ?? '0');
  const filters: DioceseVolunteerQuery = {
    name: searchParams.get('name') ?? undefined,
    isActive: searchParams.get('isActive') ?? undefined,
    region: searchParams.get('region') ?? undefined,
  };

  function buildParams(overrides: Partial<DioceseVolunteerQuery & { pageIndex: number }>) {
    const merged = { ...filters, pageIndex, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return params.toString();
  }

  const { data, isLoading, error, refetch } = useQuery<DioceseVolunteerListResponse>({
    queryKey: ['diocese-volunteers', filters, pageIndex],
    queryFn: () => getDioceseVolunteers({ ...filters, pageIndex, pageSize: DEFAULT_PAGE_SIZE }),
    enabled: user?.role !== 'manager',
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDioceseVolunteer,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['diocese-volunteers'] });
      const remaining = (data?.data ?? []).filter((c) => c.id !== deletedId);
      if (remaining.length === 0 && pageIndex > 0) {
        router.push(`${basePath}?${buildParams({ pageIndex: pageIndex - 1 })}`);
      }
    },
  });

  const handleSearch = useCallback(
    (newFilters: DioceseVolunteerQuery) => {
      const qs = buildParams({ ...newFilters, pageIndex: 0 });
      const current = searchParams.toString();
      if (qs === current) {
        refetch();
      } else {
        router.push(`${basePath}?${qs}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filters, searchParams, refetch],
  );

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      router.push(`${basePath}?${buildParams({ pageIndex: newPageIndex })}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filters],
  );

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">교구청 봉사자 관리</h1>
        <Button asChild>
          <Link href={`${basePath}/new`}>+ 봉사자 등록</Link>
        </Button>
      </div>

      <DioceseVolunteerFilters onSearch={handleSearch} initialValues={filters} />

      {error && (
        <div className="flex items-center justify-between rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : '오류가 발생했습니다.'}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>새로고침</Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !data?.data.length ? (
        <Empty message={hasFilters ? '검색 결과가 없습니다.' : '등록된 봉사자가 없습니다.'} />
      ) : (
        <DioceseVolunteerTable
          volunteers={data.data}
          onDelete={(id) => deleteMutation.mutateAsync(id)}
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

export default function DioceseVolunteersPage() {
  return (
    <Suspense>
      <DioceseVolunteersContent />
    </Suspense>
  );
}
