"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

type InventarioErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function InventarioError({ error, retry }: InventarioErrorProps) {
  useEffect(() => {
    console.error("Error al cargar el inventario:", error);
  }, [error]);

  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Inventario</h1>
        <p className="text-sm text-brown">
          Nivel de inventario de los insumos clave de tu sucursal.
        </p>
      </div>

      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <div className="flex size-24 items-center justify-center rounded-card bg-background">
          <CircleAlert aria-hidden className="size-10 text-danger" />
        </div>
        <p className="text-base font-semibold text-brown">
          No se pudo completar la operación. Intenta de nuevo
        </p>
        <Button variant="secondary" onClick={() => retry()}>
          Reintentar
        </Button>
      </div>
    </main>
  );
}