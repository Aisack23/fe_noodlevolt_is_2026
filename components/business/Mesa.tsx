import { BadgeEstado, type Estado } from "@/components/ui/BadgeEstado";
import { Button } from "@/components/ui/Button";
import type { Mesa as MesaData, MesaStatus } from "@/lib/api/salon";
import { cn } from "@/lib/cn";

// Traduce el estado del backend (inglés) al del sistema de diseño (español).
const estadoPorStatus: Record<MesaStatus, Estado> = {
  FREE: "LIBRE",
  OCCUPIED: "OCUPADA",
  TO_CLEAN: "POR_LIMPIAR",
};

type MesaProps = {
  mesa: MesaData;
  seleccionada: boolean;
  limpiando: boolean;
  onSeleccionar: (id: string) => void;
  onMarcarLimpia: (id: string) => void;
};

export function Mesa({ mesa, seleccionada, limpiando, onSeleccionar, onMarcarLimpia }: MesaProps) {
  // Una mesa por limpiar no se puede elegir hasta marcarla limpia.
  const seleccionable = mesa.status !== "TO_CLEAN";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-card border p-4",
        seleccionada ? "border-orange bg-cream" : "border-border bg-white",
      )}
    >
      <button
        type="button"
        onClick={() => onSeleccionar(mesa.id)}
        disabled={!seleccionable}
        aria-pressed={seleccionada}
        className="flex flex-col items-start gap-1 rounded-control text-left outline-none focus-visible:shadow-focus disabled:cursor-default"
      >
        <span className="font-display text-h3 font-bold uppercase text-brown">Mesa {mesa.number}</span>
        <span className="text-sm text-text-secondary">
          {mesa.capacity} {mesa.capacity === 1 ? "persona" : "personas"}
        </span>
        {mesa.hasOpenAccount && <span className="text-sm text-text-secondary">Cuenta abierta</span>}
        <BadgeEstado estado={estadoPorStatus[mesa.status]} className="mt-1" />
      </button>

      {mesa.status === "TO_CLEAN" && (
        <Button variant="secondary" onClick={() => onMarcarLimpia(mesa.id)} disabled={limpiando}>
          {limpiando ? "Marcando…" : "Marcar limpia"}
        </Button>
      )}
    </li>
  );
}