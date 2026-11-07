import { CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/cn";

export type ModalidadPago = "ONLINE" | "CAJA";

type OpcionPagoProps = {
  modalidad: ModalidadPago;
  seleccionada: boolean;
  onSeleccionar: (modalidad: ModalidadPago) => void;
  disabled?: boolean;
  className?: string;
};

const opcionesInfo: Record<
  ModalidadPago,
  { titulo: string; descripcion: string; Icon: typeof CreditCard }
> = {
  ONLINE: {
    titulo: "Pagar en línea",
    descripcion: "Pago simulado con tarjeta de débito o crédito",
    Icon: CreditCard,
  },
  CAJA: {
    titulo: "Pagar en caja",
    descripcion: "Pagas al retirar tu pedido en la sucursal",
    Icon: Banknote,
  },
};

export function OpcionPago({
  modalidad,
  seleccionada,
  onSeleccionar,
  disabled = false,
  className,
}: OpcionPagoProps) {
  const { titulo, descripcion, Icon } = opcionesInfo[modalidad];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      disabled={disabled}
      onClick={() => onSeleccionar(modalidad)}
      className={cn(
        "flex w-full items-start gap-4 rounded-card border-2 p-4 text-left transition-all outline-none",
        "focus-visible:shadow-focus",
        seleccionada
          ? "border-crimson bg-cream/40"
          : "border-border bg-white hover:border-orange",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-control",
          seleccionada ? "bg-crimson text-white" : "bg-cream text-brown",
        )}
      >
        <Icon aria-hidden className="size-5" />
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-base font-semibold text-brown">{titulo}</span>
        <span className="text-sm text-text-secondary">{descripcion}</span>
      </div>

      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5",
          seleccionada ? "border-crimson bg-white" : "border-border bg-white",
        )}
      >
        {seleccionada && <span className="size-2.5 rounded-full bg-crimson" />}
      </div>
    </button>
  );
}

