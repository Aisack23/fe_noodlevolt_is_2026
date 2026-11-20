import { Skeleton } from "@/components/ui/Skeleton";

export default function TopDishesLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-20 w-full rounded-card" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-control" />
        ))}
      </div>
    </div>
  );
}
