import { Skeleton } from "@/components/ui/Skeleton";

export default function ReservasLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-4 py-8 sm:py-12">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-control" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-control" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-control" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-32 rounded-control" />
          </div>

          <Skeleton className="h-11 w-full rounded-control" />
        </div>
      </div>
    </main>
  );
}
