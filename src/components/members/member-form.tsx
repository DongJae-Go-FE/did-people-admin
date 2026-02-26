'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
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
  parish: string;
  cathedral: string;
  phone: string;
  emergencyNum: string;
  chosenDiocese: string;
  region: string;
}

export function MemberForm({ initialData, onSubmit, mode }: MemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({
    name: initialData?.name ?? '',
    age: initialData?.age?.toString() ?? '',
    nation: initialData?.nation ?? '',
    parish: initialData?.parish ?? '',
    cathedral: initialData?.cathedral ?? '',
    phone: initialData?.phone ?? '',
    emergencyNum: initialData?.emergencyNum ?? '',
    chosenDiocese: initialData?.chosenDiocese ?? '',
    region: initialData?.region ?? '',
  });

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: Partial<Member> = {
      name: form.name,
      nation: form.nation || undefined,
      parish: form.parish || undefined,
      cathedral: form.cathedral || undefined,
      phone: form.phone || undefined,
      emergencyNum: form.emergencyNum || undefined,
      chosenDiocese: form.chosenDiocese || undefined,
      region: form.region || undefined,
    };
    if (form.age) payload.age = Number(form.age);

    try {
      await onSubmit(payload);
      router.push('/members');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const fields: Array<{ key: keyof FormState; label: string; type?: string; required?: boolean }> = [
    { key: 'name', label: '이름', required: true },
    { key: 'age', label: '나이', type: 'number' },
    { key: 'nation', label: '국적' },
    { key: 'parish', label: '본당' },
    { key: 'cathedral', label: '성당' },
    { key: 'phone', label: '연락처', type: 'tel' },
    { key: 'emergencyNum', label: '비상 연락처', type: 'tel' },
    { key: 'chosenDiocese', label: '선택 교구' },
    { key: 'region', label: '지역' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mode === 'create' ? '멤버 등록' : '멤버 수정'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {fields.map(({ key, label, type = 'text', required }) => (
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
              onClick={() => router.push('/members')}
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
