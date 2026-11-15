"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ReservacionesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en pantalla de reservaciones:", error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-card bg-cream text-brown border border-border">
        <AlertCircle aria-hidden className="size-10 text-brown" />
      </div>
      <p className="text-base font-semibold text-brown">
        No se pudo completar la operación. Intenta de nuevo
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={() => reset()}
        className="mt-2"
      >
        <RotateCw aria-hidden className="size-4" />
        Reintentar
      </Button>
    </main>
  );
}
