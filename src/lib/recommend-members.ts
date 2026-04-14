import type { Member, Churchgoer } from '@/types';

export interface RecommendContext {
  churchgoer: Churchgoer;
  assignedCount: number;
}

export interface ScoredMember extends Member {
  _score: number;
  _reasons: string[];
}

export function scoreMember(member: Member, ctx: RecommendContext): ScoredMember {
  const { churchgoer } = ctx;
  let score = 0;
  const reasons: string[] = [];

  // 본당 매칭 (+40)
  if (
    member.parish &&
    churchgoer.parish &&
    member.parish.trim() === churchgoer.parish.trim()
  ) {
    score += 40;
    reasons.push('본당 일치');
  }

  // 선택교구 매칭 (+20)
  if (member.chosenDiocese && churchgoer.parish) {
    const diocese = member.chosenDiocese.trim();
    const parish = churchgoer.parish.trim();
    if (parish.includes(diocese) || diocese.includes(parish)) {
      score += 20;
      reasons.push('교구 일치');
    }
  }

  // 성별 선호 (+20)
  // Member에 성별 필드가 없으므로, '상관없음'이면 만점, 아니면 낮은 점수
  if (!churchgoer.pilgrimGender || churchgoer.pilgrimGender === '상관없음') {
    score += 20;
  } else {
    // 성별 정보 부재로 확실한 매칭 불가 — 점수 0 (필터링하지 않음)
  }

  // 수용 여력 (+20)
  const max = churchgoer.maxCapacity ?? 0;
  const remaining = max - ctx.assignedCount;
  if (remaining > 0) {
    score += 20;
    // 여력이 많을수록 보너스 (최대 +5)
    score += Math.min(remaining - 1, 5);
  }

  return { ...member, _score: score, _reasons: reasons };
}

export function getRecommendedMembers(
  unassigned: Member[],
  ctx: RecommendContext,
): ScoredMember[] {
  return unassigned
    .map((m) => scoreMember(m, ctx))
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return (a.name ?? '').localeCompare(b.name ?? '', 'ko');
    });
}
