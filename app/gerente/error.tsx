"use client";

import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";

export default function GerenciaError({ reset }: { reset: () => void }) {
  return (
    <main className="space-y-4 px-4 py-6 md:px-8">
      <Alerta tono="danger">No se pudieron cargar los datos. Intenta de nuevo.</Alerta>
      <Button variant="secondary" onClick={reset}>Reintentar</Button>
    </main>
  );
}
