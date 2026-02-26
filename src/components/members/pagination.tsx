'use client';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  pageIndex: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}

export function Pagination({ pageIndex, totalCount, pageSize, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(totalPages - 1, pageIndex + 2);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        총 {totalCount}명 · {pageIndex + 1} / {totalPages} 페이지
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex <= 0}
        >
          이전
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === pageIndex ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
            className="w-8"
          >
            {p + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
