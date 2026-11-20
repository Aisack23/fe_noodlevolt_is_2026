import { Skeleton } from "@/components/ui/Skeleton";

export default function SucursalesLoading() {
  return (
    <main aria-label="Cargando sucursales" className="grid gap-4 px-4 py-6 sm:grid-cols-2 md:px-8 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-64 rounded-card" />)}
    </main>
  );
}
