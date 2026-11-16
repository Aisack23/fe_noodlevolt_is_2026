import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { Button } from "@/components/ui/Button";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { TextareaContador } from "@/components/ui/TextareaContador";
import { formatUsd, toCents, type SalonDish } from "@/lib/api/salon";
import { cn } from "@/lib/cn";

type PlatilloFilaProps = {
  dish: SalonDish;
  quantity: number;
  note: string;
  onIncrementar: () => void;
  onDisminuir: () => void;
  onNota: (note: string) => void;
  onQuitar: () => void;
};

export function PlatilloFila({
  dish,
  quantity,
  note,
  onIncrementar,
  onDisminuir,
  onNota,
  onQuitar,
}: PlatilloFilaProps) {
  const agregado = quantity > 0;
  const agotadoEnPedido = agregado && !dish.available;

  return (
    <li
      className={cn(
        "rounded-card border bg-white p-4",
        agotadoEnPedido ? "border-danger" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-brown">{dish.name}</p>
          <p className="text-sm text-text-secondary">{formatUsd(toCents(dish.price))}</p>
          {quantity >= 20 && (
            <p className="text-sm text-text-secondary">Máximo 20 unidades por platillo.</p>
          )}
        </div>

        {dish.available ? (
          <CantidadStepper
            cantidad={quantity}
            min={0}
            onIncrementar={onIncrementar}
            onDisminuir={onDisminuir}
            ariaLabel={`Cantidad de ${dish.name}`}
          />
        ) : (
          <div className="flex items-center gap-2">
            <BadgeEstado estado="AGOTADO" />
            {agregado && (
              <Button variant="secondary" onClick={onQuitar}>
                Quitar
              </Button>
            )}
          </div>
        )}
      </div>

      {agregado && dish.available && (
        <div className="mt-3">
          <TextareaContador
            label="Nota (opcional)"
            value={note}
            onChange={onNota}
            placeholder="Ej.: sin cebolla, extra picante"
            ayuda="Se envía a Cocina con el platillo."
          />
        </div>
      )}
    </li>
  );
}