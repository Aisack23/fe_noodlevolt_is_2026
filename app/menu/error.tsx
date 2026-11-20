"use client";

import { useEffect } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";

type MenuErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function MenuError({ error, retry }: MenuErrorProps) {
  useEffect(() => {
    console.error("Error al cargar el menú:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-[1232px] flex-col items-start gap-6 px-4 py-6">
      <h1 className="font-display text-h1 font-bold uppercase text-brown">Menú</h1>
      <Alerta className="w-full">No se pudo completar la operación. Intenta de nuevo</Alerta>
      <Button onClick={() => retry()}>Reintentar</Button>
    </main>
  );
}