"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { PlatilloFila } from "@/components/business/PlatilloFila";
import { ResumenComanda } from "@/components/business/ResumenComanda";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { ChipCategoria } from "@/components/ui/ChipCategoria";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  SalonApiError,
  createSalonOrder,
  getSalonMenu,
  toCents,
  type Mesa,
  type SalonDish,
  type SalonOrderResult,
} from "@/lib/api/salon";

const CATEGORIAS = ["Todas", "Entradas", "Platos fuertes", "Bebidas"] as const;
const MAX_CANTIDAD = 20;
const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

type Carrito = Record<string, { quantity: number; note: string }>;
type Carga = "cargando" | "listo" | "error";

type PasoPlatillosProps = {
  mesa: Mesa;
  onAtras: () => void;
  onEnviado: (resultado: SalonOrderResult) => void;
};

export function PasoPlatillos({ mesa, onAtras, onEnviado }: PasoPlatillosProps) {
  const [menu, setMenu] = useState<SalonDish[]>([]);
  const [carga, setCarga] = useState<Carga>("cargando");
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>("Todas");
  const [carrito, setCarrito] = useState<Carrito>({});
  const [operationKey, setOperationKey] = useState(() => crypto.randomUUID());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMenu = useCallback(async () => {
    try {
      setMenu(await getSalonMenu());
      setCarga("listo");
    } catch {
      setCarga("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void cargarMenu(), 0);
    return () => window.clearTimeout(timer);
  }, [cargarMenu]);

  function reintentarMenu() {
    setCarga("cargando");
    void cargarMenu();
  }

  function guardarLinea(dishId: string, quantity: number, note: string) {
    setCarrito((actual) => {
      const copia = { ...actual };
      if (quantity <= 0) delete copia[dishId];
      else copia[dishId] = { quantity, note };
      return copia;
    });
    // Contenido nuevo = intento nuevo: el backend rechaza la misma clave con otro contenido.
    setOperationKey(crypto.randomUUID());
  }

  function cambiarCantidad(dishId: string, delta: number) {
    const actual = carrito[dishId] ?? { quantity: 0, note: "" };
    const quantity = Math.min(MAX_CANTIDAD, Math.max(0, actual.quantity + delta));
    guardarLinea(dishId, quantity, actual.note);
  }

  function cambiarNota(dishId: string, note: string) {
    const actual = carrito[dishId];
    if (actual) guardarLinea(dishId, actual.quantity, note);
  }

  function quitar(dishId: string) {
    guardarLinea(dishId, 0, "");
    setError(null);
  }

  const lineas = menu
    .filter((platillo) => carrito[platillo.id])
    .map((platillo) => {
      const { quantity, note } = carrito[platillo.id];
      return { platillo, quantity, note, subtotalCents: toCents(platillo.price) * quantity };
    });
  const totalCents = lineas.reduce((suma, linea) => suma + linea.subtotalCents, 0);
  const hayAgotado = lineas.some((linea) => !linea.platillo.available);
  // Los platillos agotados que están en el pedido van primero, para verlos junto al aviso.
const prioridad = (platillo: SalonDish) =>
  !platillo.available && carrito[platillo.id] ? 0 : 1;
const visibles = menu
  .filter((p) => categoria === "Todas" || p.category === categoria)
  .sort((a, b) => prioridad(a) - prioridad(b));

  async function confirmar() {
    if (enviando || lineas.length === 0 || hayAgotado) return;
    setEnviando(true);
    setError(null);
    try {
      const resultado = await createSalonOrder({
        tableId: mesa.id,
        operationKey,
        lines: lineas.map((linea) => ({
          dishId: linea.platillo.id,
          quantity: linea.quantity,
          note: linea.note.trim() || null,
        })),
      });
      onEnviado(resultado);
    } catch (fallo) {
      if (fallo instanceof SalonApiError && fallo.status === 409 && fallo.dishId) {
        const nombre = menu.find((p) => p.id === fallo.dishId)?.name ?? "Un platillo";
        setError(`«${nombre}» ya no está disponible. Quítalo para confirmar; el resto del pedido se conserva.`);
        try {
          setMenu(await getSalonMenu());
        } catch {
          // Si no se pudo refrescar el menú, el aviso de arriba sigue siendo válido.
        }
      } else {
        setError(GENERIC_ERROR);
      }
      setEnviando(false);
    }
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <h1 className="font-display text-h2 font-bold uppercase text-brown">
        Nueva comanda · Mesa {mesa.number}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">Paso 2 de 3 · Agrega platillos</p>

      {error && (
        <Alerta tono="danger" className="mt-5">
          <p className="font-semibold">No se pudo enviar el pedido</p>
          <p>{error}</p>
        </Alerta>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIAS.map((nombre) => (
          <ChipCategoria key={nombre} activo={categoria === nombre} onClick={() => setCategoria(nombre)}>
            {nombre}
          </ChipCategoria>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          {carga === "cargando" && (
            <div aria-busy="true" aria-label="Cargando menú" className="flex flex-col gap-4">
              {[0, 1, 2].map((indice) => (
                <Skeleton key={indice} className="h-24 w-full" />
              ))}
            </div>
          )}

          {carga === "error" && (
            <div className="flex flex-col items-start gap-4">
              <Alerta tono="danger">{GENERIC_ERROR}</Alerta>
              <Button onClick={reintentarMenu}>
                <RefreshCw aria-hidden className="size-5" />
                Reintentar
              </Button>
            </div>
          )}

          {carga === "listo" && (
            <ul aria-label="Platillos" className="flex flex-col gap-4">
              {visibles.map((platillo) => (
                <PlatilloFila
                  key={platillo.id}
                  dish={platillo}
                  quantity={carrito[platillo.id]?.quantity ?? 0}
                  note={carrito[platillo.id]?.note ?? ""}
                  onIncrementar={() => cambiarCantidad(platillo.id, 1)}
                  onDisminuir={() => cambiarCantidad(platillo.id, -1)}
                  onNota={(nota) => cambiarNota(platillo.id, nota)}
                  onQuitar={() => quitar(platillo.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <ResumenComanda
          mesa={mesa}
          lineas={lineas.map((linea) => ({
            id: linea.platillo.id,
            name: linea.platillo.name,
            quantity: linea.quantity,
            subtotalCents: linea.subtotalCents,
            note: linea.note,
          }))}
          totalCents={totalCents}
          enviando={enviando}
          bloqueado={lineas.length === 0 || hayAgotado}
          onConfirmar={() => void confirmar()}
          onAtras={onAtras}
        />
      </div>
    </main>
  );
}