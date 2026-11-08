import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type CantidadStepperProps = {
  cantidad: number;
  min?: number;
  max?: number;
  onIncrementar: () => void;
  onDisminuir: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function CantidadStepper({
  cantidad,
  min = 1,
  max = 20,
  onIncrementar,
  onDisminuir,
  disabled = false,
  className,
  ariaLabel = "Cantidad",
}: CantidadStepperProps) {
  const noPuedeDisminuir = disabled || cantidad <= min;
  const noPuedeIncrementar = disabled || cantidad >= max;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-control border border-border bg-white p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDisminuir}
        disabled={noPuedeDisminuir}
        aria-label="Disminuir cantidad"
        className={cn(
          "inline-flex size-9 sm:size-10 items-center justify-center rounded-lg text-brown transition-colors outline-none",
          "focus-visible:shadow-focus hover:bg-cream",
          "disabled:cursor-not-allowed disabled:text-neutral disabled:hover:bg-transparent",
        )}
      >
        <Minus aria-hidden className="size-4" />
      </button>

      <span
        aria-live="polite"
        className="min-w-8 text-center text-base font-semibold text-brown select-none"
      >
        {cantidad}
      </span>

      <button
        type="button"
        onClick={onIncrementar}
        disabled={noPuedeIncrementar}
        aria-label="Aumentar cantidad"
        className={cn(
          "inline-flex size-9 sm:size-10 items-center justify-center rounded-lg text-brown transition-colors outline-none",
          "focus-visible:shadow-focus hover:bg-cream",
          "disabled:cursor-not-allowed disabled:text-neutral disabled:hover:bg-transparent",
        )}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}

