"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentRegion } from "@/hooks/use-current-region";
import type { MemberQuery } from "@/types";

interface MemberFiltersProps {
  onSearch: (query: MemberQuery) => void;
  initialValues?: MemberQuery;
}

export function MemberFilters({
  onSearch,
  initialValues = {},
}: MemberFiltersProps) {
  const router = useRouter();
  const { user } = useAuth();
  const region = useCurrentRegion();

  const filterKey = useMemo(
    () => JSON.stringify(initialValues),
    [initialValues],
  );

  const isAdmin = user?.role === "admin";
  const isMaster = user?.role === "master";

  return (
    <MemberFiltersInner
      key={filterKey}
      onSearch={onSearch}
      initialValues={initialValues}
      isAdmin={isAdmin}
      isMaster={isMaster}
      onReset={() => router.push(region ? `/${region}/members` : "/members")}
    />
  );
}

interface InnerProps {
  onSearch: (query: MemberQuery) => void;
  initialValues: MemberQuery;
  isAdmin?: boolean;
  isMaster?: boolean;
  onReset: () => void;
}

function MemberFiltersInner({
  onSearch,
  initialValues,
  isAdmin,
  isMaster,
  onReset,
}: InnerProps) {
  const [name, setName] = useState(initialValues.name ?? "");
  const [parish, setParish] = useState(initialValues.parish ?? "");
  const [diocese, setDiocese] = useState(initialValues.diocese ?? "");
  const [cathedral, setCathedral] = useState(initialValues.cathedral ?? "");
  const [filterRegion, setFilterRegion] = useState(initialValues.region ?? "all");

  function handleSearch() {
    onSearch({
      name,
      parish,
      diocese,
      cathedral,
      ...(isMaster ? { region: filterRegion } : {}),
    });
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="filter-name" className="text-xs">이름</Label>
          <Input
            id="filter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                <SelectItem value="suwon">수원교구</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {(isAdmin || isMaster) && (
          <div className="space-y-1">
            <Label htmlFor="filter-parish" className="text-xs">소속 본당</Label>
            <Input
              id="filter-parish"
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="본당 검색"
              className="h-8 text-sm"
            />
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="filter-diocese" className="text-xs">소속 교구</Label>
          <Input
            id="filter-diocese"
            value={diocese}
            onChange={(e) => setDiocese(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="교구 검색"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-cathedral" className="text-xs">배정 성당</Label>
          <Input
            id="filter-cathedral"
            value={cathedral}
            onChange={(e) => setCathedral(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="성당 검색"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSearch}>
          검색
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          초기화
        </Button>
      </div>
    </div>
  );
}
