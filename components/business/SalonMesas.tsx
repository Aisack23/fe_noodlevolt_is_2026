import { Mesa } from "@/components/business/Mesa";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Mesa as MesaData } from "@/lib/api/salon";

type SalonMesasProps = {
  mesas: MesaData[];
  seleccionadaId: string | null;
  limpiandoId: string | null;
  onSeleccionar: (id: string) => void;
  onMarcarLimpia: (id: string) => void;
};

export function SalonMesas({
  mesas,
  seleccionadaId,
  limpiandoId,
  onSeleccionar,
  onMarcarLimpia,
}: SalonMesasProps) {
  if (mesas.length === 0) {
    return <EstadoVacio titulo="No hay mesas" mensaje="Esta sucursal todavía no tiene mesas registradas." />;
  }

  return (
    <ul aria-label="Mesas del salón" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {mesas.map((mesa) => (
        <Mesa
          key={mesa.id}
          mesa={mesa}
          seleccionada={seleccionadaId === mesa.id}
          limpiando={limpiandoId === mesa.id}
          onSeleccionar={onSeleccionar}
          onMarcarLimpia={onMarcarLimpia}
        />
      ))}
    </ul>
  );
}

export function SalonMesasCargando() {
  return (
    <div aria-busy="true" aria-label="Cargando mesas" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  );
}