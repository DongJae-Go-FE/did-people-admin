"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
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

  const filterKey = useMemo(
    () => JSON.stringify(initialValues),
    [initialValues],
  );

  return (
    <MemberFiltersInner
      key={filterKey}
      onSearch={onSearch}
      initialValues={initialValues}
      isAdmin={user?.role === "admin"}
      onReset={() => router.push("/members")}
    />
  );
}

interface InnerProps {
  onSearch: (query: MemberQuery) => void;
  initialValues: MemberQuery;
  isAdmin?: boolean;
  onReset: () => void;
}

function MemberFiltersInner({
  onSearch,
  initialValues,
  isAdmin,
  onReset,
}: InnerProps) {
  const [name, setName] = useState(initialValues.name ?? "");
  const [parish, setParish] = useState(initialValues.parish ?? "");
  const [cathedral, setCathedral] = useState(initialValues.cathedral ?? "");
  const [chosenDiocese, setChosenDiocese] = useState(
    initialValues.chosenDiocese ?? "",
  );
  const [region, setRegion] = useState(initialValues.region ?? "");

  function handleSearch() {
    onSearch({ name, parish, cathedral, chosenDiocese, region });
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="filter-name" className="text-xs">
            이름
          </Label>
          <Input
            id="filter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="이름 검색"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-parish" className="text-xs">
            본당
          </Label>
          <Input
            id="filter-parish"
            value={parish}
            onChange={(e) => setParish(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="본당 검색"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-cathedral" className="text-xs">
            성당
          </Label>
          <Input
            id="filter-cathedral"
            value={cathedral}
            onChange={(e) => setCathedral(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="성당 검색"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-diocese" className="text-xs">
            선택 교구
          </Label>
          <Input
            id="filter-diocese"
            value={chosenDiocese}
            onChange={(e) => setChosenDiocese(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="교구 검색"
            className="h-8 text-sm"
          />
        </div>
        {isAdmin && (
          <div className="space-y-1">
            <Label htmlFor="filter-region" className="text-xs">
              지역
            </Label>
            <Input
              id="filter-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="지역 검색"
              className="h-8 text-sm"
            />
          </div>
        )}
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
