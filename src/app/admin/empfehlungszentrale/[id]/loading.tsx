import { Skeleton } from '@/components/ui/skeleton';

export default function AdminReferralDetailLoading() {
  return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
