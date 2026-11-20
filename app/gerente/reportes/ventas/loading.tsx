import { Skeleton } from "@/components/ui/Skeleton";

export default function VentasLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-20 w-full rounded-card" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 w-full rounded-card" />
        <Skeleton className="h-36 w-full rounded-card" />
      </div>
    </div>
  );
}
