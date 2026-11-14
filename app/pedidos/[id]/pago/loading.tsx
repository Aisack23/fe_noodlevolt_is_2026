import { Skeleton } from "@/components/ui/Skeleton";

export default function PagoLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="rounded-card border-2 border-brown bg-cream p-6 sm:p-8 flex flex-col gap-6">
          <Skeleton className="h-5 w-40" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full rounded-control" />
            <Skeleton className="h-20 w-full rounded-control" />
          </div>
          <Skeleton className="h-16 w-full rounded-control" />
          <Skeleton className="h-12 w-full rounded-control" />
        </div>
      </div>
    </main>
  );
}
