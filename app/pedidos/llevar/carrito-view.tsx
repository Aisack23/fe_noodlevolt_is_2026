"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, Trash2, Clock } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { Button } from "@/components/ui/Button";
import { Alerta } from "@/components/ui/Alerta";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { OpcionPago, type ModalidadPago } from "@/components/business/OpcionPago";
import { useAuth } from "@/lib/auth/auth-context";
import type { Pedido } from "@/lib/orders/types";
import { clearOperationKey, getOperationKey } from "@/lib/orders/operation-key";
import { submitTakeoutOrder } from "./actions";
import { CarritoItem } from "./carrito-item";

const formatoPrecio = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type CarritoViewProps = {
  onPedidoConfirmado: (pedido: Pedido) => void;
};

export function CarritoView({ onPedidoConfirmado }: CarritoViewProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    items,
    sucursal,
    subtotal,
    total,
    totalItems,
    incrementarCantidad,
    disminuirCantidad,
    eliminarPlatillo,
    vaciarCarrito,
  } = useCart();

  const [modalidadPago, setModalidadPago] = useState<ModalidadPago>("ONLINE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToLogin = () => {
    router.push("/login?returnTo=%2Fpedidos%2Fllevar");
  };

  const handleVaciarCarrito = () => {
    clearOperationKey();
    vaciarCarrito();
  };

  const handleConfirmar = async () => {
    setError(null);
    if (items.length === 0) {
      setError("El carrito está vacío. Agrega platillos antes de continuar.");
      return;
    }

    if (!sucursal) {
      setError("No hay una sucursal seleccionada.");
      return;
    }

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (user?.rol !== "CLIENT") {
      setError("Tu cuenta no tiene permisos para realizar pedidos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestFingerprint = JSON.stringify({
        branchId: sucursal.id,
        paymentMode: modalidadPago,
        lines: items.map((item) => ({
          dishId: item.platilloId,
          quantity: item.cantidad,
          expectedPrice: item.precio.toFixed(2),
        })),
      });
      const requestOperationKey = getOperationKey(requestFingerprint);
      const result = await submitTakeoutOrder({
        branchId: sucursal.id,
        branchName: sucursal.nombre,
        operationKey: requestOperationKey,
        paymentMode: modalidadPago === "CAJA" ? "AT_COUNTER" : "ONLINE",
        lines: items.map((item) => ({
          dishId: item.platilloId,
          quantity: item.cantidad,
          expectedPrice: item.precio.toFixed(2),
        })),
      });

      if (!result.ok) {
        if (result.kind === "unauthenticated") {
          redirectToLogin();
          return;
        }
        setError(result.message);
        return;
      }

      // Vaciar carrito tras registro exitoso
      clearOperationKey();
      vaciarCarrito();
      onPedidoConfirmado(result.pedido);
    } catch {
      setError("Ocurrió un error inesperado al procesar el pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1232px] flex-col px-4 py-8 sm:py-12">
        <EstadoVacio
          titulo="Tu carrito está vacío"
          mensaje="Aún no has agregado platillos. Explora nuestro menú y encuentra tus favoritos."
          accion={
            <Link href="/menu">
              <Button variant="primary">Ver menú</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <MapPin aria-hidden className="size-4 text-crimson" />
            <span>Sucursal de retiro:</span>
            <span className="font-semibold text-brown">
              {sucursal?.nombre || "San Salvador – Centro"}
            </span>
          </div>
          <h1 className="font-display text-h1 font-bold uppercase text-brown">
            Tu carrito
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:text-crimson-hover outline-none focus-visible:shadow-focus rounded-control py-1 px-2"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Seguir agregando
          </Link>
          <button
            type="button"
            onClick={handleVaciarCarrito}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-danger outline-none focus-visible:shadow-focus rounded-control py-1 px-2"
          >
            <Trash2 aria-hidden className="size-4" />
            Vaciar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista de platillos */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-text-secondary px-1">
            <span>
              {totalItems} {totalItems === 1 ? "platillo" : "platillos"} en total
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CarritoItem
                key={item.platilloId}
                item={item}
                onIncrementar={() => incrementarCantidad(item.platilloId)}
                onDisminuir={() => disminuirCantidad(item.platilloId)}
                onEliminar={() => eliminarPlatillo(item.platilloId)}
              />
            ))}
          </div>
        </div>

        {/* Resumen del pedido y opciones de pago */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="rounded-card border-2 border-brown bg-cream p-6 flex flex-col gap-6 shadow-sm">
            <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown border-b border-border pb-3">
              Resumen del pedido
            </h2>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
                <span className="font-semibold text-brown">
                  {formatoPrecio.format(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Retiro en sucursal</span>
                <span className="font-semibold text-success">Gratis</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-display text-h3 font-bold uppercase text-brown">
                Total
              </span>
              <span className="font-display text-h2 font-bold text-crimson">
                {formatoPrecio.format(total)}
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-control bg-white p-3 border border-border">
              <Clock aria-hidden className="size-5 text-orange shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary">
                <span className="font-semibold text-brown block mb-0.5">
                  Tiempo estimado de preparación
                </span>
                Tu pedido estará listo aproximadamente 20 minutos después de confirmarlo.
              </div>
            </div>

            {/* Modalidad de pago */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-brown">
                Modalidad de pago
              </span>
              <div className="flex flex-col gap-2">
                <OpcionPago
                  modalidad="ONLINE"
                  seleccionada={modalidadPago === "ONLINE"}
                  onSeleccionar={setModalidadPago}
                  disabled={isSubmitting}
                />
                <OpcionPago
                  modalidad="CAJA"
                  seleccionada={modalidadPago === "CAJA"}
                  onSeleccionar={setModalidadPago}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <Alerta tono="danger" className="text-sm">
                {error}
              </Alerta>
            )}

            <Button
              type="button"
              variant="primary"
              loading={isSubmitting}
              loadingText="Confirmando pedido…"
              onClick={handleConfirmar}
              className="w-full text-base py-3"
            >
              Confirmar pedido · {formatoPrecio.format(total)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

