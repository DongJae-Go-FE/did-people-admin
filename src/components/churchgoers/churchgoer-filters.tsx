'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import type { ChurchgoerQuery } from '@/types';

interface ChurchgoerFiltersProps {
  onSearch: (query: ChurchgoerQuery) => void;
  initialValues?: ChurchgoerQuery;
}

export function ChurchgoerFilters({ onSearch, initialValues = {} }: ChurchgoerFiltersProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState(initialValues.name ?? '');
  const [parish, setParish] = useState(initialValues.parish ?? '');

  useEffect(() => {
    setName(initialValues.name ?? '');
    setParish(initialValues.parish ?? '');
  }, [initialValues.name, initialValues.parish]);

  function handleSearch() {
    onSearch({ name, parish });
  }

  function handleReset() {
    router.push('/churchgoers');
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="filter-name" className="text-xs">이름</Label>
          <Input
            id="filter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="이름 검색"
            className="h-8 text-sm"
          />
        </div>
        {mounted && user?.role === 'admin' && (
          <div className="space-y-1">
            <Label htmlFor="filter-parish" className="text-xs">본당</Label>
            <Input
              id="filter-parish"
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="본당 검색"
              className="h-8 text-sm"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSearch}>검색</Button>
        <Button size="sm" variant="outline" onClick={handleReset}>초기화</Button>
      </div>
    </div>
  );
}
