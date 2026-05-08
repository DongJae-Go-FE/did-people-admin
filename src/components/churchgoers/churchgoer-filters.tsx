'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentRegion } from '@/hooks/use-current-region';
import type { ChurchgoerQuery } from '@/types';

interface ChurchgoerFiltersProps {
  onSearch: (query: ChurchgoerQuery) => void;
  initialValues?: ChurchgoerQuery;
}

export function ChurchgoerFilters({ onSearch, initialValues = {} }: ChurchgoerFiltersProps) {
  const router = useRouter();
  const { user } = useAuth();
  const region = useCurrentRegion();

  const filterKey = useMemo(() => JSON.stringify(initialValues), [initialValues]);

  const isAdmin = user?.role === 'admin';
  const isMaster = user?.role === 'master';

  return (
    <ChurchgoerFiltersInner
      key={filterKey}
      onSearch={onSearch}
      initialValues={initialValues}
      isAdmin={isAdmin}
      isMaster={isMaster}
      onReset={() => router.push(region ? `/${region}/churchgoers` : '/churchgoers')}
    />
  );
}

interface InnerProps {
  onSearch: (query: ChurchgoerQuery) => void;
  initialValues: ChurchgoerQuery;
  isAdmin?: boolean;
  isMaster?: boolean;
  onReset: () => void;
}

function ChurchgoerFiltersInner({ onSearch, initialValues, isAdmin, isMaster, onReset }: InnerProps) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [parish, setParish] = useState(initialValues.parish ?? '');
  const [filterRegion, setFilterRegion] = useState(initialValues.region ?? 'all');

  function handleSearch() {
    onSearch({
      name,
      parish,
      ...(isMaster ? { region: filterRegion } : {}),
    });
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
        {isMaster && (
          <div className="space-y-1">
            <Label className="text-xs">지역</Label>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="incheon">인천교구</SelectItem>
                <SelectItem value="jeju">제주교구</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {(isAdmin || isMaster) && (
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
        <Button size="sm" variant="outline" onClick={onReset}>초기화</Button>
      </div>
    </div>
  );
}
