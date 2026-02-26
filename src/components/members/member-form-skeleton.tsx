import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MemberFormSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-6">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
