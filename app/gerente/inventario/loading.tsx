import { Skeleton } from "@/components/ui/Skeleton";

const columnas = "grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4";

export default function InventarioLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="flex flex-col gap-6 px-4 py-6 md:px-8"
    >
      <span className="sr-only">Cargando el inventario…</span>

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Inventario</h1>
        <p className="text-sm text-brown">
          Nivel de inventario de los insumos clave de tu sucursal.
        </p>
      </div>

      <div className="flex flex-col">
        <div className={`${columnas} h-11 bg-background`}>
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`${columnas} h-14 border-b border-border`}>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}