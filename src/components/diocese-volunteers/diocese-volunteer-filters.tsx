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
import type { DioceseVolunteerQuery } from '@/types';

interface Props {
  onSearch: (query: DioceseVolunteerQuery) => void;
  initialValues?: DioceseVolunteerQuery;
}

export function DioceseVolunteerFilters({ onSearch, initialValues = {} }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const region = useCurrentRegion();
  const filterKey = useMemo(() => JSON.stringify(initialValues), [initialValues]);
  const isMaster = user?.role === 'master';

  return (
    <FiltersInner
      key={filterKey}
      onSearch={onSearch}
      initialValues={initialValues}
      isMaster={isMaster}
      onReset={() => router.push(region ? `/${region}/diocese-volunteers` : '/diocese-volunteers')}
    />
  );
}

interface InnerProps {
  onSearch: (query: DioceseVolunteerQuery) => void;
  initialValues: DioceseVolunteerQuery;
  isMaster?: boolean;
  onReset: () => void;
}

function FiltersInner({ onSearch, initialValues, isMaster, onReset }: InnerProps) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [isActive, setIsActive] = useState(initialValues.isActive ?? 'all');
  const [filterRegion, setFilterRegion] = useState(initialValues.region ?? 'all');

  function handleSearch() {
    onSearch({
      name,
      isActive: isActive === 'all' ? undefined : isActive,
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
        <div className="space-y-1">
          <Label className="text-xs">현재 봉사 여부</Label>
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="true">활동중</SelectItem>
              <SelectItem value="false">비활동</SelectItem>
            </SelectContent>
          </Select>
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
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSearch}>검색</Button>
        <Button size="sm" variant="outline" onClick={onReset}>초기화</Button>
      </div>
    </div>
  );
}
