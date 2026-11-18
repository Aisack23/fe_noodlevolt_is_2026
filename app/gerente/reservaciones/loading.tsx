import { Skeleton } from "@/components/ui/Skeleton";

export default function ReservacionesLoading() {
  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
      {/* Encabezado con Skeleton de Título y Filtro */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-11 w-44 rounded-control" />
        </div>
      </div>

      {/* Tabla con Skeleton idéntico a Cargando.png */}
      <div className="rounded-card border border-border bg-white p-4 shadow-sm flex flex-col gap-4">
        {/* Cabecera de columnas */}
        <div className="grid grid-cols-5 gap-4 border-b border-border pb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* 6 Filas de esqueletos */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-border/40 items-center">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </main>
  );
}
