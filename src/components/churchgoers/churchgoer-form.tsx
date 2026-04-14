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

function RadioGroup({ name, value, options, onChange }: {
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="h-4 w-4"
          />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

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

export function ChurchgoerForm({ initialData, onSubmit, mode }: ChurchgoerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 기본 정보
  const [district, setDistrict] = useState(initialData?.district ?? '');
  const [ban, setBan] = useState(initialData?.ban ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [baptismalName, setBaptismalName] = useState(initialData?.baptismalName ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [parish, setParish] = useState(initialData?.parish ?? '');
  const [familyType, setFamilyType] = useState(initialData?.familyType ?? '');
  const [childrenCount, setChildrenCount] = useState(initialData?.childrenCount?.toString() ?? '');
  const [familyTypeOther, setFamilyTypeOther] = useState(initialData?.familyTypeOther ?? '');
  const [housingType, setHousingType] = useState(initialData?.housingType ?? '');
  const [housingTypeOther, setHousingTypeOther] = useState(initialData?.housingTypeOther ?? '');
  const [availableRooms, setAvailableRooms] = useState(initialData?.availableRooms?.toString() ?? '');

  // 숙박
  const [pilgrimGender, setPilgrimGender] = useState(initialData?.pilgrimGender ?? '');
  const [maxCapacity, setMaxCapacity] = useState(initialData?.maxCapacity?.toString() ?? '');
  const [clergyAcceptable, setClergyAcceptable] = useState(initialData?.clergyAcceptable ?? false);
  const [bedroomType, setBedroomType] = useState(initialData?.bedroomType ?? '');
  const [bedCount, setBedCount] = useState(initialData?.bedCount?.toString() ?? '');
  const [futonCount, setFutonCount] = useState(initialData?.futonCount?.toString() ?? '');
  const [bathroomType, setBathroomType] = useState(initialData?.bathroomType ?? '');
  const [hasPet, setHasPet] = useState(initialData?.hasPet ?? false);
  const [petType, setPetType] = useState(initialData?.petType ?? '');
  const [petLocation, setPetLocation] = useState(initialData?.petLocation ?? '');
  const [hasWifi, setHasWifi] = useState(initialData?.hasWifi ?? false);
  const [hasWasher, setHasWasher] = useState(initialData?.hasWasher ?? false);

  // 식사 및 흡연
  const [breakfastAvailable, setBreakfastAvailable] = useState(initialData?.breakfastAvailable ?? false);
  const [dinnerAvailable, setDinnerAvailable] = useState(initialData?.dinnerAvailable ?? false);
  const [smokingPolicy, setSmokingPolicy] = useState(initialData?.smokingPolicy ?? '');

  // 이동 지원
  const [transportationType, setTransportationType] = useState(initialData?.transportationType ?? '');

  // 비고
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
      district: district || undefined,
      ban: ban || undefined,
      familyType: familyType || undefined,
      childrenCount: childrenCount ? Number(childrenCount) : undefined,
      familyTypeOther: familyType === '기타' ? (familyTypeOther || undefined) : undefined,
      housingType: housingType || undefined,
      housingTypeOther: housingType === '기타' ? (housingTypeOther || undefined) : undefined,
      pilgrimGender: pilgrimGender || undefined,
      clergyAcceptable,
      bedroomType: bedroomType || undefined,
      bedCount: bedCount ? Number(bedCount) : undefined,
      futonCount: futonCount ? Number(futonCount) : undefined,
      bathroomType: bathroomType || undefined,
      hasPet,
      petType: hasPet ? (petType || undefined) : undefined,
      petLocation: hasPet ? (petLocation || undefined) : undefined,
      hasWifi,
      hasWasher,
      smokingPolicy: smokingPolicy || undefined,
      transportationType: transportationType || undefined,
      breakfastAvailable,
      dinnerAvailable,
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
      {/* 섹션 1: 봉사자 기본 정보 */}
      <Card>
        <CardHeader><CardTitle>봉사자 기본 정보</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="f-district" className="text-sm">구역</Label>
              <Input id="f-district" value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-ban" className="text-sm">반</Label>
              <Input id="f-ban" value={ban} onChange={(e) => setBan(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-name" className="text-sm">가구주 성명</Label>
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
            <div className="space-y-1 col-span-2">
              <Label htmlFor="f-address" className="text-sm">도로명 주소</Label>
              <Input id="f-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-parish" className="text-sm">본당</Label>
              <Input id="f-parish" value={parish} onChange={(e) => setParish(e.target.value)} />
            </div>
          </div>

          {/* 가족 구성원 */}
          <div className="space-y-2">
            <Label className="text-sm">가족 구성원</Label>
            <RadioGroup
              name="familyType"
              value={familyType}
              options={[
                { label: '부부', value: '부부' },
                { label: '부부+자녀', value: '부부+자녀' },
                { label: '1인가구(남)', value: '1인가구(남)' },
                { label: '1인가구(여)', value: '1인가구(여)' },
                { label: '기타', value: '기타' },
              ]}
              onChange={setFamilyType}
            />
            {familyType === '부부+자녀' && (
              <div className="space-y-1 max-w-32">
                <Label htmlFor="f-children" className="text-xs text-gray-500">자녀 수</Label>
                <Input id="f-children" type="number" min="0" value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)} />
              </div>
            )}
            {familyType === '기타' && (
              <div className="space-y-1 max-w-64">
                <Label htmlFor="f-family-other" className="text-xs text-gray-500">기타 입력</Label>
                <Input id="f-family-other" value={familyTypeOther} onChange={(e) => setFamilyTypeOther(e.target.value)} />
              </div>
            )}
          </div>

          {/* 주거 형태 */}
          <div className="space-y-2">
            <Label className="text-sm">주거 형태</Label>
            <RadioGroup
              name="housingType"
              value={housingType}
              options={[
                { label: '아파트', value: '아파트' },
                { label: '빌라/단독', value: '빌라/단독' },
                { label: '기타', value: '기타' },
              ]}
              onChange={setHousingType}
            />
            {housingType === '기타' && (
              <div className="space-y-1 max-w-64">
                <Label htmlFor="f-housing-other" className="text-xs text-gray-500">기타 입력</Label>
                <Input id="f-housing-other" value={housingTypeOther} onChange={(e) => setHousingTypeOther(e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-1 max-w-32">
            <Label htmlFor="f-rooms" className="text-sm">방 개수</Label>
            <Input id="f-rooms" type="number" min="0" value={availableRooms} onChange={(e) => setAvailableRooms(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* 섹션 2: 숙박 */}
      <Card>
        <CardHeader><CardTitle>숙박</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">순례자 성별 선호</Label>
            <RadioGroup
              name="pilgrimGender"
              value={pilgrimGender}
              options={[
                { label: '남성', value: '남성' },
                { label: '여성', value: '여성' },
                { label: '상관없음', value: '상관없음' },
              ]}
              onChange={setPilgrimGender}
            />
          </div>

          <div className="space-y-1 max-w-32">
            <Label htmlFor="f-capacity" className="text-sm">수용 가능 인원</Label>
            <Input id="f-capacity" type="number" min="0" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
          </div>

          <Checkbox checked={clergyAcceptable} onChange={setClergyAcceptable} label="성직자/수도자 수용 가능" />

          <div className="space-y-2">
            <Label className="text-sm">침실 제공</Label>
            <RadioGroup
              name="bedroomType"
              value={bedroomType}
              options={[
                { label: '독립된 방', value: '독립된 방' },
                { label: '거실 분리 사용', value: '거실 분리 사용' },
              ]}
              onChange={setBedroomType}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-64">
            <div className="space-y-1">
              <Label htmlFor="f-bed" className="text-sm">침대 수</Label>
              <Input id="f-bed" type="number" min="0" value={bedCount} onChange={(e) => setBedCount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-futon" className="text-sm">온돌/이불 세트</Label>
              <Input id="f-futon" type="number" min="0" value={futonCount} onChange={(e) => setFutonCount(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">욕실 사용</Label>
            <RadioGroup
              name="bathroomType"
              value={bathroomType}
              options={[
                { label: '단독', value: '단독' },
                { label: '공용', value: '공용' },
              ]}
              onChange={setBathroomType}
            />
          </div>

          {/* 반려동물 */}
          <div className="space-y-2">
            <Checkbox checked={hasPet} onChange={setHasPet} label="반려동물 있음" />
            {hasPet && (
              <div className="grid grid-cols-2 gap-4 max-w-md pl-6">
                <div className="space-y-1">
                  <Label htmlFor="f-pet-type" className="text-xs text-gray-500">종류</Label>
                  <Input id="f-pet-type" value={petType} onChange={(e) => setPetType(e.target.value)} placeholder="예: 강아지" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">거주</Label>
                  <RadioGroup
                    name="petLocation"
                    value={petLocation}
                    options={[
                      { label: '실내', value: '실내' },
                      { label: '실외', value: '실외' },
                    ]}
                    onChange={setPetLocation}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 편의시설 */}
          <div className="space-y-2">
            <Label className="text-sm">편의시설</Label>
            <div className="flex flex-wrap gap-6">
              <Checkbox checked={hasWifi} onChange={setHasWifi} label="Wi-Fi" />
              <Checkbox checked={hasWasher} onChange={setHasWasher} label="세탁기" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 섹션 3: 식사 및 흡연 */}
      <Card>
        <CardHeader><CardTitle>식사 및 흡연</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">식사 제공</Label>
            <div className="flex flex-wrap gap-6">
              <Checkbox checked={breakfastAvailable} onChange={setBreakfastAvailable} label="아침식사" />
              <Checkbox checked={dinnerAvailable} onChange={setDinnerAvailable} label="저녁식사" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">흡연 정책</Label>
            <RadioGroup
              name="smokingPolicy"
              value={smokingPolicy}
              options={[
                { label: '금연 가정', value: '금연 가정' },
                { label: '실외 흡연 가능', value: '실외 흡연 가능' },
              ]}
              onChange={setSmokingPolicy}
            />
          </div>
        </CardContent>
      </Card>

      {/* 섹션 4: 이동 지원 */}
      <Card>
        <CardHeader><CardTitle>이동 지원</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup
            name="transportationType"
            value={transportationType}
            options={[
              { label: '자가 차량', value: '자가 차량' },
              { label: '대중교통 동행', value: '대중교통 동행' },
              { label: '도보 이동', value: '도보 이동' },
            ]}
            onChange={setTransportationType}
          />
        </CardContent>
      </Card>

      {/* 비고 */}
      <Card>
        <CardHeader><CardTitle>비고</CardTitle></CardHeader>
        <CardContent>
          <textarea
            id="f-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          />
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
