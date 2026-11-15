"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PlatilloFila } from "@/components/business/PlatilloFila";
import { ResumenComanda } from "@/components/business/ResumenComanda";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { ChipCategoria } from "@/components/ui/ChipCategoria";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  SalonApiError,
  createSalonOrder,
  toCents,
  type Mesa,
  type SalonDish,
  type SalonOrderResult,
} from "@/lib/api/salon";
import { refreshMenu } from "./actions";

const TODAS = "Todas";
const MAX_CANTIDAD = 20;
const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

type Carrito = Record<string, { quantity: number; note: string }>;
type Carga = "cargando" | "listo" | "error";

type PasoPlatillosProps = {
  mesa: Mesa;
  initialDishes: SalonDish[];
  initialError: boolean;
  onAtras: () => void;
  onEnviado: (resultado: SalonOrderResult) => void;
};

export function PasoPlatillos({ mesa, initialDishes, initialError, onAtras, onEnviado }: PasoPlatillosProps) {
  const [menu, setMenu] = useState(initialDishes);
  const [carga, setCarga] = useState<Carga>(initialError ? "error" : "listo");
  const [categoria, setCategoria] = useState(TODAS);
  const [carrito, setCarrito] = useState<Carrito>({});
  const [operationKey, setOperationKey] = useState(() => crypto.randomUUID());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reintentarMenu() {
    setCarga("cargando");
    const respuesta = await refreshMenu();
    if (respuesta.ok) {
      setMenu(respuesta.dishes);
      setCarga("listo");
    } else {
      setCarga("error");
    }
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

  const categorias = [TODAS, ...Array.from(new Set(menu.map((platillo) => platillo.category)))];
  const categoriaActiva = categorias.includes(categoria) ? categoria : TODAS;

  // Los platillos agotados que están en el pedido van primero, para verlos junto al aviso.
  const prioridad = (platillo: SalonDish) => (!platillo.available && carrito[platillo.id] ? 0 : 1);
  const visibles = menu
    .filter((platillo) => categoriaActiva === TODAS || platillo.category === categoriaActiva)
    .sort((a, b) => prioridad(a) - prioridad(b));

  async function confirmar() {
    if (enviando || lineas.length === 0 || hayAgotado) return;
    setEnviando(true);
    setError(null);
    try {
      const resultado = await createSalonOrder({
        tableId: mesa.id,
        tableNumber: mesa.number,
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
        const nombre = menu.find((platillo) => platillo.id === fallo.dishId)?.name ?? "Un platillo";
        setError(`«${nombre}» ya no está disponible. Quítalo para confirmar; el resto del pedido se conserva.`);
        const respuesta = await refreshMenu();
        if (respuesta.ok) setMenu(respuesta.dishes);
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

      {carga === "listo" && menu.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {categorias.map((nombre) => (
            <ChipCategoria key={nombre} activo={categoriaActiva === nombre} onClick={() => setCategoria(nombre)}>
              {nombre}
            </ChipCategoria>
          ))}
        </div>
      )}

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
              <Button onClick={() => void reintentarMenu()}>
                <RefreshCw aria-hidden className="size-5" />
                Reintentar
              </Button>
            </div>
          )}

          {carga === "listo" && menu.length === 0 && (
            <EstadoVacio titulo="No hay platillos" mensaje="Esta sucursal todavía no tiene platillos en el menú." />
          )}

          {carga === "listo" && menu.length > 0 && (
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