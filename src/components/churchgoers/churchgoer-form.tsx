'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { Churchgoer } from '@/types';

interface ChurchgoerFormProps {
  initialData?: Partial<Churchgoer>;
  onSubmit: (data: Partial<Churchgoer>) => Promise<void>;
  mode: 'create' | 'edit';
}

export function ChurchgoerForm({ initialData, onSubmit, mode }: ChurchgoerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(initialData?.name ?? '');
  const [baptismalName, setBaptismalName] = useState(initialData?.baptismalName ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [parish, setParish] = useState(initialData?.parish ?? '');
  const [breakfastAvailable, setBreakfastAvailable] = useState(initialData?.breakfastAvailable ?? false);
  const [lunchAvailable, setLunchAvailable] = useState(initialData?.lunchAvailable ?? false);
  const [dinnerAvailable, setDinnerAvailable] = useState(initialData?.dinnerAvailable ?? false);
  const [mealOnlyAvailable, setMealOnlyAvailable] = useState(initialData?.mealOnlyAvailable ?? false);
  const [homestayAvailable, setHomestayAvailable] = useState(initialData?.homestayAvailable ?? false);
  const [homestayDates, setHomestayDates] = useState(initialData?.homestayDates ?? '');
  const [availableRooms, setAvailableRooms] = useState(initialData?.availableRooms?.toString() ?? '');
  const [maxCapacity, setMaxCapacity] = useState(initialData?.maxCapacity?.toString() ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: Partial<Churchgoer> = {
      name: name || undefined,
      baptismalName: baptismalName || undefined,
      phone: phone || undefined,
      address: address || undefined,
      parish: parish || undefined,
      breakfastAvailable,
      lunchAvailable,
      dinnerAvailable,
      mealOnlyAvailable,
      homestayAvailable,
      homestayDates: homestayDates || undefined,
      availableRooms: availableRooms ? Number(availableRooms) : undefined,
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      notes: notes || undefined,
    };

    try {
      await onSubmit(payload);
      router.push('/churchgoers');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="f-name" className="text-sm">이름</Label>
              <Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-baptismal" className="text-sm">세례명</Label>
              <Input id="f-baptismal" value={baptismalName} onChange={(e) => setBaptismalName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-phone" className="text-sm">연락처</Label>
              <Input id="f-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-address" className="text-sm">주소</Label>
              <Input id="f-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-parish" className="text-sm">본당</Label>
              <Input id="f-parish" value={parish} onChange={(e) => setParish(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>식사 제공</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {[
              { id: 'breakfast', label: '아침', checked: breakfastAvailable, set: setBreakfastAvailable },
              { id: 'lunch', label: '점심', checked: lunchAvailable, set: setLunchAvailable },
              { id: 'dinner', label: '저녁', checked: dinnerAvailable, set: setDinnerAvailable },
              { id: 'mealOnly', label: '식사만 제공', checked: mealOnlyAvailable, set: setMealOnlyAvailable },
            ].map(({ id, label, checked, set }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => set(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>숙박 정보</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={homestayAvailable}
                onChange={(e) => setHomestayAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">홈스테이 가능</span>
            </label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="f-dates" className="text-sm">가능 날짜</Label>
                <Input id="f-dates" value={homestayDates} onChange={(e) => setHomestayDates(e.target.value)} placeholder="예: 2026-08-01 ~ 2026-08-15" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="f-rooms" className="text-sm">방 수</Label>
                <Input id="f-rooms" type="number" min="0" value={availableRooms} onChange={(e) => setAvailableRooms(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="f-capacity" className="text-sm">수용 인원</Label>
                <Input id="f-capacity" type="number" min="0" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>기타</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label htmlFor="f-notes" className="text-sm">비고</Label>
            <textarea
              id="f-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="min-w-16">
          {loading ? <Spinner size="sm" className="border-white border-t-transparent" /> : mode === 'create' ? '등록' : '수정'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/churchgoers')} disabled={loading}>
          취소
        </Button>
      </div>
    </form>
  );
}
