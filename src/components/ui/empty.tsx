import { cn } from '@/lib/utils';

interface EmptyProps {
  message?: string;
  className?: string;
}

export function Empty({ message = '데이터가 없습니다.', className }: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border bg-white py-16 text-center',
        className,
      )}
    >
      <div className="text-4xl">📭</div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
