import { Skeleton } from '@/components/ui/skeleton';

const COLS = 9;
const ROWS = 10;

export function MemberTableSkeleton() {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* header */}
      <div className="grid border-b px-4 py-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: COLS }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: ROWS }).map((_, row) => (
        <div
          key={row}
          className="grid items-center border-b px-4 py-3 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: COLS }).map((_, col) => (
            <Skeleton
              key={col}
              className={col === COLS - 1 ? 'h-7 w-20' : 'h-4 w-full max-w-[80px]'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
