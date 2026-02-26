'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getMembers, deleteMember, exportMembersExcel } from '@/lib/api';
import { MemberTable } from '@/components/members/member-table';
import { Spinner } from '@/components/ui/spinner';
import { MemberFilters } from '@/components/members/member-filters';
import { Pagination } from '@/components/members/pagination';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import type { MemberListResponse, MemberQuery } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

function MembersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const pageIndex = Number(searchParams.get('pageIndex') ?? '0');
  const filters: MemberQuery = {
    name: searchParams.get('name') ?? undefined,
    parish: searchParams.get('parish') ?? undefined,
    cathedral: searchParams.get('cathedral') ?? undefined,
    chosenDiocese: searchParams.get('chosenDiocese') ?? undefined,
    region: searchParams.get('region') ?? undefined,
  };

  function buildParams(overrides: Partial<MemberQuery & { pageIndex: number }>) {
    const merged = { ...filters, pageIndex, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return params.toString();
  }

  const { data, isLoading, error, refetch } = useQuery<MemberListResponse>({
    queryKey: ['members', filters, pageIndex],
    queryFn: () => getMembers({ ...filters, pageIndex, pageSize: DEFAULT_PAGE_SIZE }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      // 삭제 후 현재 페이지 데이터가 비면 1페이지로
      const remaining = (data?.data ?? []).filter((m) => m.id !== deletedId);
      if (remaining.length === 0 && pageIndex > 0) {
        router.push(`/members?${buildParams({ pageIndex: pageIndex - 1 })}`);
      }
    },
  });

  const handleSearch = useCallback(
    (newFilters: MemberQuery) => {
      const qs = buildParams({ ...newFilters, pageIndex: 0 });
      const current = searchParams.toString();
      if (qs === current) {
        refetch();
      } else {
        router.push(`/members?${qs}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filters, searchParams, refetch],
  );

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      router.push(`/members?${buildParams({ pageIndex: newPageIndex })}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, filters],
  );

  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportMembersExcel(filters);
    } finally {
      setIsExporting(false);
    }
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">멤버 관리</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? '생성 중...' : 'Excel 내보내기'}
          </Button>
          <Button asChild>
            <Link href="/members/new">+ 멤버 등록</Link>
          </Button>
        </div>
      </div>

      <MemberFilters onSearch={handleSearch} initialValues={filters} />

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
        <Empty message={hasFilters ? '검색 결과가 없습니다.' : '등록된 멤버가 없습니다.'} />
      ) : (
        <MemberTable
          members={data.data}
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

export default function MembersPage() {
  return (
    <Suspense>
      <MembersContent />
    </Suspense>
  );
}
