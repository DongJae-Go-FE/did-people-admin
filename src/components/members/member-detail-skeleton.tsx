import { Skeleton } from '@/components/ui/skeleton';

export function MemberDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
      <div className="rounded-lg border bg-white divide-y">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center px-6 py-3 gap-4">
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
