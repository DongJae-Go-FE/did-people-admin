'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
import { getMemberParishes } from '@/lib/api';
import type { Member } from '@/types';

interface MemberFormProps {
  initialData?: Partial<Member>;
  onSubmit: (data: Partial<Member>) => Promise<void>;
  mode: 'create' | 'edit';
}

interface FormState {
  name: string;
  age: string;
  nation: string;
  region: string;
  parish: string;
  diocese: string;
  cathedral: string;
  phone: string;
  emergencyNum: string;
}

export function MemberForm({ initialData, onSubmit, mode }: MemberFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const region = useCurrentRegion();
  const listHref = region ? `/${region}/members` : '/members';
  const isMaster = user?.role === 'master';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({
    name: initialData?.name ?? '',
    age: initialData?.age?.toString() ?? '',
    nation: initialData?.nation ?? '',
    region: initialData?.region ?? '',
    parish: initialData?.parish ?? '',
    diocese: initialData?.diocese ?? '',
    cathedral: initialData?.cathedral ?? '',
    phone: initialData?.phone ?? '',
    emergencyNum: initialData?.emergencyNum ?? '',
  });

  // 본당 후보 목록: master만 사용. region이 선택돼 있을 때만 fetch
  const parishesQuery = useQuery({
    queryKey: ['member-parishes', form.region],
    queryFn: () => getMemberParishes(form.region || undefined),
    enabled: isMaster && !!form.region,
  });
  const parishOptions = parishesQuery.data ?? [];

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return; // 진행 중 재제출(엔터/더블클릭) 차단
    setError('');
    setLoading(true);

    const payload: Partial<Member> = {
      name: form.name,
      nation: form.nation || undefined,
      parish: form.parish || undefined,
      diocese: form.diocese || undefined,
      cathedral: form.cathedral || undefined,
      phone: form.phone || undefined,
      emergencyNum: form.emergencyNum || undefined,
    };
    if (form.age) payload.age = Number(form.age);
    // master만 region을 직접 지정 가능
    if (isMaster && form.region) payload.region = form.region;

    try {
      await onSubmit(payload);
      // 성공 시 loading 유지 — 목록 이동 동안 버튼 비활성으로 재제출 방지
      router.push(listHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
      setLoading(false);
    }
  }

  const inputFields: Array<{ key: keyof FormState; label: string; type?: string; required?: boolean }> = [
    { key: 'name', label: '이름', required: true },
    { key: 'age', label: '나이', type: 'number' },
    { key: 'nation', label: '국적' },
    { key: 'diocese', label: '소속 교구' },
    { key: 'cathedral', label: '배정 성당' },
    { key: 'phone', label: '연락처', type: 'tel' },
    { key: 'emergencyNum', label: '비상 연락처', type: 'tel' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mode === 'create' ? '멤버 등록' : '멤버 수정'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* 이름 */}
            <div className="space-y-1">
              <Label htmlFor="field-name" className="text-sm">
                이름<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="field-name"
                value={form.name}
                onChange={handleChange('name')}
                required
              />
            </div>

            {/* master 전용: 지역 select */}
            {isMaster && (
              <div className="space-y-1">
                <Label className="text-sm">지역</Label>
                <Select
                  value={form.region || undefined}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, region: v, parish: '' }))
                  }
                >
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

            {/* 본당: master는 select(직접 입력 가능), 그 외는 자유 입력 */}
            {isMaster ? (
              <div className="space-y-1">
                <Label htmlFor="field-parish" className="text-sm">소속 본당</Label>
                <Input
                  id="field-parish"
                  list="parish-options"
                  value={form.parish}
                  onChange={handleChange('parish')}
                  disabled={!form.region}
                  placeholder={form.region ? '본당 선택 또는 입력' : '먼저 지역 선택'}
                />
                <datalist id="parish-options">
                  {parishOptions.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="field-parish" className="text-sm">소속 본당</Label>
                <Input id="field-parish" value={form.parish} onChange={handleChange('parish')} />
              </div>
            )}

            {/* 나머지 입력 필드 */}
            {inputFields.slice(1).map(({ key, label, type = 'text', required }) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`field-${key}`} className="text-sm">
                  {label}{required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={`field-${key}`}
                  type={type}
                  value={form[key]}
                  onChange={handleChange(key)}
                  required={required}
                  min={type === 'number' ? 0 : undefined}
                />
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="min-w-16">
              {loading ? <Spinner size="sm" className="border-white border-t-transparent" /> : mode === 'create' ? '등록' : '수정'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(listHref)}
              disabled={loading}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
