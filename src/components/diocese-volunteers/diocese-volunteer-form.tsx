'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentRegion } from '@/hooks/use-current-region';
import type { DioceseVolunteer } from '@/types';

interface DioceseVolunteerFormProps {
  initialData?: Partial<DioceseVolunteer>;
  onSubmit: (data: Partial<DioceseVolunteer>) => Promise<void>;
  mode: 'create' | 'edit';
}

// 미리 정의된 봉사 종류. UI 체크박스 옵션.
const PRESET_SERVICES = ['전례', '해설', '복사', '악기', '사무', '성가대', '안내', '청소'];

function Checkbox({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function DioceseVolunteerForm({ initialData, onSubmit, mode }: DioceseVolunteerFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const region = useCurrentRegion();
  const listHref = region ? `/${region}/diocese-volunteers` : '/diocese-volunteers';
  const isMaster = user?.role === 'master';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialServices = initialData?.possibleServices ?? [];
  // preset 에 없는 값들은 모두 "기타" 자유입력 칸으로 분리해서 표시
  const initialPresets = initialServices.filter((s) => PRESET_SERVICES.includes(s));
  const initialOthers = initialServices.filter((s) => !PRESET_SERVICES.includes(s));

  const [name, setName] = useState(initialData?.name ?? '');
  const [baptismalName, setBaptismalName] = useState(initialData?.baptismalName ?? '');
  const [age, setAge] = useState(initialData?.age?.toString() ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [services, setServices] = useState<string[]>(initialPresets);
  const [otherServices, setOtherServices] = useState<string[]>(initialOthers);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [intention, setIntention] = useState(initialData?.intention ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [formRegion, setFormRegion] = useState(initialData?.region ?? '');

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return; // 진행 중 재제출(엔터/더블클릭) 차단
    setError('');

    if (isMaster && mode === 'create' && !formRegion) {
      setError('지역(교구)을 선택해주세요.');
      return;
    }

    setLoading(true);

    const merged = [
      ...services,
      ...otherServices.map((s: string) => s.trim()).filter(Boolean),
    ];

    const payload: Partial<DioceseVolunteer> = {
      name: name || undefined,
      baptismalName: baptismalName || undefined,
      age: age ? Number(age) : undefined,
      email: email || undefined,
      address: address || undefined,
      possibleServices: merged,
      isActive,
      intention: intention || undefined,
      notes: notes || undefined,
      ...(isMaster && formRegion ? { region: formRegion } : {}),
    };

    try {
      await onSubmit(payload);
      // 성공 시 loading 유지 — 목록 이동 동안 버튼 비활성으로 재제출 방지
      router.push(listHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {isMaster && (
              <div className="space-y-1">
                <Label className="text-sm">지역(교구)</Label>
                <Select value={formRegion || undefined} onValueChange={setFormRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incheon">인천교구</SelectItem>
                    <SelectItem value="jeju">제주교구</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="f-name" className="text-sm">이름</Label>
              <Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-baptismal" className="text-sm">세례명</Label>
              <Input id="f-baptismal" value={baptismalName} onChange={(e) => setBaptismalName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-age" className="text-sm">나이</Label>
              <Input id="f-age" type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-email" className="text-sm">이메일</Label>
              <Input id="f-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="f-address" className="text-sm">주소</Label>
              <Input id="f-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 봉사 */}
      <Card>
        <CardHeader><CardTitle>봉사 정보</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">가능한 봉사</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {PRESET_SERVICES.map((s) => (
                <Checkbox
                  key={s}
                  checked={services.includes(s)}
                  onChange={() => toggleService(s)}
                  label={s}
                />
              ))}
            </div>
            <div className="space-y-2 max-w-md">
              <Label className="text-xs text-gray-500">기타 봉사 (직접 입력 · 여러 개 가능)</Label>
              {otherServices.length === 0 && (
                <p className="text-xs text-gray-400">아래 + 버튼으로 추가하세요</p>
              )}
              {otherServices.map((val, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={val}
                    onChange={(e) => {
                      const next = [...otherServices];
                      next[idx] = e.target.value;
                      setOtherServices(next);
                    }}
                    placeholder="예: 다도, 통역 등"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOtherServices(otherServices.filter((_, i) => i !== idx))}
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOtherServices([...otherServices, ''])}
              >
                + 기타 추가
              </Button>
            </div>
          </div>

          <Checkbox
            checked={isActive}
            onChange={setIsActive}
            label="현재 봉사 중"
          />

          <div className="space-y-1">
            <Label htmlFor="f-intention" className="text-sm">봉사 의향</Label>
            <textarea
              id="f-intention"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-20"
              placeholder="예: 주말만 가능, 평일 저녁 가능 등"
            />
          </div>
        </CardContent>
      </Card>

      {/* 비고 */}
      <Card>
        <CardHeader><CardTitle>특이사항</CardTitle></CardHeader>
        <CardContent>
          <textarea
            id="f-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-20"
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="min-w-16">
          {loading ? <Spinner size="sm" className="border-white border-t-transparent" /> : mode === 'create' ? '등록' : '수정'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(listHref)} disabled={loading}>
          취소
        </Button>
      </div>
    </form>
  );
}
