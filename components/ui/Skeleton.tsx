import { cn } from "@/lib/cn";

type SkeletonProps = { className?: string };


export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn("animate-pulse rounded-control bg-border", className)} />;
}

export function SkeletonTarjeta({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-card border border-border p-4", className)}>
      <Skeleton className="h-42 w-full" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
}