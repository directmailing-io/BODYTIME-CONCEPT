import { Skeleton } from '@/components/ui/skeleton';

export default function EmpfehlungLoading() {
  return (
    <div className="max-w-2xl space-y-5">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
