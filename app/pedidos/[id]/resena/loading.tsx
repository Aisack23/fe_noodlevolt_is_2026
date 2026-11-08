import { Skeleton } from "@/components/ui/Skeleton";

export default function ResenaPedidoLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8"
    >
      <span className="sr-only">Cargando el pedido…</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72 max-w-full" />
      </div>
      <section className="space-y-4 rounded-card border border-border bg-white p-5 sm:p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-32" />
      </section>
      <section className="space-y-5 rounded-card border border-border bg-white p-5 sm:p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-64 max-w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-11 w-40" />
      </section>
    </main>
  );
}
