"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { SalonMesas, SalonMesasCargando } from "@/components/business/SalonMesas";
import { Alerta } from "@/components/ui/Alerta";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { Button } from "@/components/ui/Button";
import {
  SalonApiError,
  getMesas,
  markMesaClean,
  type Mesa,
  type SalonOrderResult,
} from "@/lib/api/salon";
import { PasoPlatillos } from "./paso-platillos";

type Carga = "cargando" | "listo" | "error";
type Resultado = SalonOrderResult & { sumadaACuenta: boolean };

const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

export function ComandaFlow() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carga, setCarga] = useState<Carga>("cargando");
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [limpiandoId, setLimpiandoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const seleccionada = mesas.find((mesa) => mesa.id === seleccionadaId) ?? null;

  const cargarMesas = useCallback(async () => {
    try {
      setMesas(await getMesas());
      setCarga("listo");
    } catch {
      setCarga("error");
    }
  }, []);

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

  function nuevaComanda() {
    setPaso(1);
    setSeleccionadaId(null);
    setResultado(null);
    setCarga("cargando");
    void cargarMesas();
  }

  if (paso === 3 && resultado) {
    const platillos = resultado.lineCount === 1 ? "platillo enviado" : "platillos enviados";
    return (
      <main className="px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-border bg-white p-8 text-center">
          <h1 className="font-display text-h2 font-bold uppercase text-brown">
            Pedido #{resultado.orderNumber} enviado
          </h1>
          <p className="text-base text-text-secondary">
            Mesa {resultado.tableNumber} · {resultado.lineCount} {platillos} a Cocina.
            {resultado.sumadaACuenta && " Se sumó a la cuenta abierta."}
          </p>
          <BadgeEstado estado="PENDIENTE" />
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/mesero/salon"
              className="inline-flex min-h-11 items-center justify-center rounded-control border-2 border-orange px-6 py-3 text-base font-semibold text-brown outline-none hover:bg-orange/16 focus-visible:shadow-focus"
            >
              Ver salón
            </Link>
            <Button onClick={nuevaComanda}>Nueva comanda</Button>
          </div>
        </div>
      </main>
    );
  }

  if (paso === 2 && seleccionada) {
    return (
      <PasoPlatillos
        mesa={seleccionada}
        onAtras={() => setPaso(1)}
        onEnviado={(enviado) => {
          setResultado({ ...enviado, sumadaACuenta: seleccionada.hasOpenAccount });
          setPaso(3);
        }}
      />
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