'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, assignMembers } from '@/lib/api';
import { getRecommendedMembers, type ScoredMember } from '@/lib/recommend-members';
import type { Churchgoer, Member } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

type Tab = 'search' | 'recommend';

interface MemberAssignDialogProps {
  churchgoerId: string;
  churchgoer?: Churchgoer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberAssignDialog({ churchgoerId, churchgoer, open, onOpenChange }: MemberAssignDialogProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('search');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['members', 'all-for-assign'],
    queryFn: () => getMembers({ pageSize: 9999 }),
    enabled: open,
  });

  const unassigned = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((m) => !m.assignedChurchgoer);
  }, [data]);

  // 전체 검색 탭 필터
  const filtered = useMemo(() => {
    if (!search.trim()) return unassigned;
    const q = search.trim().toLowerCase();
    return unassigned.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.parish?.toLowerCase().includes(q) ||
        m.nation?.toLowerCase().includes(q),
    );
  }, [unassigned, search]);

  // 추천 탭 결과
  const recommended = useMemo(() => {
    if (!churchgoer) return [];
    const assignedCount = churchgoer.assignedMemberCount ?? churchgoer.assignedMembers?.length ?? 0;
    return getRecommendedMembers(unassigned, { churchgoer, assignedCount });
  }, [unassigned, churchgoer]);

  const mutation = useMutation({
    mutationFn: () => assignMembers(churchgoerId, Array.from(selected)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churchgoer', churchgoerId] });
      queryClient.invalidateQueries({ queryKey: ['churchgoers'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setSelected(new Set());
      setSearch('');
      onOpenChange(false);
    },
  });

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderMemberItem(m: Member | ScoredMember) {
    const id = Number(m.id);
    const scored = '_score' in m ? (m as ScoredMember) : null;
    return (
      <li key={m.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => toggle(id)}>
        <input
          type="checkbox"
          checked={selected.has(id)}
          onChange={() => toggle(id)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{m.name ?? '-'}</p>
            {scored && scored._reasons.map((r) => (
              <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                {r}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {[m.nation, m.parish].filter(Boolean).join(' · ') || '-'}
            {scored ? ` — ${scored._score}점` : ''}
          </p>
        </div>
      </li>
    );
  }

  const displayList: (Member | ScoredMember)[] = tab === 'recommend' ? recommended : filtered;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>참여인원 배정</DialogTitle>
          <DialogDescription>배정할 참여인원을 선택하세요.</DialogDescription>
        </DialogHeader>

        {/* 탭 */}
        <div className="flex border-b">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
              tab === 'search'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab('search')}
          >
            전체 검색
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
              tab === 'recommend'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab('recommend')}
            disabled={!churchgoer}
          >
            추천
          </button>
        </div>

        {/* 검색 입력 (전체 검색 탭에서만) */}
        {tab === 'search' && (
          <Input
            placeholder="이름, 본당, 국적 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto border rounded-md min-h-0 max-h-64">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : displayList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {tab === 'recommend' ? '추천할 참여인원이 없습니다.' : '미배정 참여인원이 없습니다.'}
            </p>
          ) : (
            <ul className="divide-y">
              {displayList.map((m) => renderMemberItem(m))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            disabled={selected.size === 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Spinner size="sm" className="border-white border-t-transparent" /> : `배정 (${selected.size}명)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
