import { Skeleton } from "@/components/ui/Skeleton";

export default function MisPedidosLoading() {
  return (
    <main role="status" aria-busy="true" className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6 md:px-8">
      <span className="sr-only">Cargando tus pedidos…</span>
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-11 w-full max-w-sm" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-card border border-border bg-white p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
