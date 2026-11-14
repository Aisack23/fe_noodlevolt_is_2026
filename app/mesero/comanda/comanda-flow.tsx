"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { SalonMesas, SalonMesasCargando } from "@/components/business/SalonMesas";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { SalonApiError, getMesas, markMesaClean, type Mesa } from "@/lib/api/salon";

type Carga = "cargando" | "listo" | "error";

const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

export function ComandaFlow() {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carga, setCarga] = useState<Carga>("cargando");
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [limpiandoId, setLimpiandoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const seleccionada = mesas.find((mesa) => mesa.id === seleccionadaId) ?? null;

  const cargarMesas = useCallback(async () => {
    try {
      setMesas(await getMesas());
      setCarga("listo");
    } catch {
      setCarga("error");
    }
  }, []);

  // La primera carga se difiere con setTimeout, igual que en useNotifications,
  // para cumplir la regla react-hooks/set-state-in-effect.
  useEffect(() => {
    const timer = window.setTimeout(() => void cargarMesas(), 0);
    return () => window.clearTimeout(timer);
  }, [cargarMesas]);

  function reintentar() {
    setCarga("cargando");
    void cargarMesas();
  }

  async function marcarLimpia(id: string) {
    if (limpiandoId) return;
    setLimpiandoId(id);
    setErrorAccion(null);
    try {
      await markMesaClean(id);
      setMesas(await getMesas());
    } catch (error) {
      setErrorAccion(error instanceof SalonApiError ? error.message : GENERIC_ERROR);
    }
    setLimpiandoId(null);
  }

  if (paso === 2 && seleccionada) {
    return (
      <main className="px-4 py-6 md:px-8">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">
          Nueva comanda · Mesa {seleccionada.number}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Paso 2 de 3 · Agrega platillos</p>
        {/* PROVISIONAL: aquí irá el paso 2 (platillos, cantidades y notas). */}
        <p className="mt-6 text-base text-brown">El paso 2 se construye en la siguiente entrega.</p>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => setPaso(1)}>
            Atrás
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <h1 className="font-display text-h2 font-bold uppercase text-brown">Nueva comanda</h1>
      <p className="mt-1 text-sm text-text-secondary">Paso 1 de 3 · Elige la mesa</p>

      <div className="mt-6">
        {carga === "cargando" && <SalonMesasCargando />}

        {carga === "error" && (
          <div className="flex flex-col items-start gap-4">
            <Alerta tono="danger">{GENERIC_ERROR}</Alerta>
            <Button onClick={reintentar}>
              <RefreshCw aria-hidden className="size-5" />
              Reintentar
            </Button>
          </div>
        )}

        {carga === "listo" && (
          <SalonMesas
            mesas={mesas}
            seleccionadaId={seleccionadaId}
            limpiandoId={limpiandoId}
            onSeleccionar={setSeleccionadaId}
            onMarcarLimpia={marcarLimpia}
          />
        )}
      </div>

      {errorAccion && (
        <Alerta tono="danger" className="mt-5">
          {errorAccion}
        </Alerta>
      )}

      {seleccionada?.hasOpenAccount && (
        <Alerta tono="info" className="mt-5">
          <p className="font-semibold">Mesa {seleccionada.number} tiene una cuenta abierta</p>
          <p>El nuevo pedido se sumará a esa cuenta con su propio número.</p>
        </Alerta>
      )}

      <div className="mt-6 flex justify-end">
        <Button disabled={!seleccionada} onClick={() => setPaso(2)}>
          {seleccionada ? `Continuar con Mesa ${seleccionada.number}` : "Continuar"}
        </Button>
      </div>
    </main>
  );
}