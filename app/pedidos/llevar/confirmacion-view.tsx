"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { Button } from "@/components/ui/Button";
import { Alerta } from "@/components/ui/Alerta";
import { type Pedido, mapearEstadoPedidoABadge } from "@/lib/orders/types";

const formatoPrecio = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type ConfirmacionViewProps = {
  pedido: Pedido;
  onNuevoPedido: () => void;
};

export function ConfirmacionView({
  pedido,
  onNuevoPedido,
}: ConfirmacionViewProps) {
  const esOnline = pedido.modalidadPago === "ONLINE";

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6 px-4 py-8 sm:py-12">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 size-24 sm:size-28">
          <Image
            src="/brand/Logo/Mascota.jpeg"
            alt="NoodleVolt"
            fill
            sizes="112px"
            priority
            className="object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-sm font-semibold text-success mb-2">
          <CheckCircle aria-hidden className="size-4" />
          Registro exitoso
        </div>

        <h1 className="font-display text-h1 font-bold uppercase tracking-wide text-brown">
          ¡Pedido registrado!
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          Tu pedido para llevar ha sido creado con éxito.
        </p>
      </div>

      <div className="w-full rounded-card border-2 border-brown bg-cream p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-secondary">
              Identificador del pedido
            </span>
            <h2 className="font-display text-h2 font-bold text-crimson">
              {pedido.codigo}
            </h2>
          </div>

          <BadgeEstado
            estado={mapearEstadoPedidoABadge(pedido.estado)}
            className="self-start sm:self-auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-control bg-white p-4 border border-border">
          <div className="flex items-start gap-3">
            <MapPin aria-hidden className="size-5 text-crimson shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Sucursal de retiro</span>
              <span className="text-sm font-semibold text-brown">
                {pedido.sucursalNombre}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock aria-hidden className="size-5 text-orange shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Hora estimada de retiro</span>
              <span className="text-sm font-semibold text-brown">
                {pedido.horaEstimadaRetiro} (aprox. 20 min)
              </span>
            </div>
          </div>
        </div>

        {esOnline ? (
          <Alerta tono="info" className="text-sm">
            Tu pedido pasa a Cocina cuando se apruebe el pago.
          </Alerta>
        ) : (
          <Alerta tono="success" className="text-sm">
            Tu pedido ya está en Cocina. Paga {formatoPrecio.format(pedido.total)} en caja al retirar.
          </Alerta>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Detalle de platillos
          </h3>
          <ul className="divide-y divide-border/60 rounded-control bg-white border border-border px-4">
            {pedido.items.map((item) => (
              <li
                key={item.platilloId}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-crimson min-w-6">
                    {item.cantidad}×
                  </span>
                  <span className="font-semibold text-brown">{item.nombre}</span>
                </div>
                <span className="font-medium text-brown">
                  {formatoPrecio.format(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-h3 font-bold uppercase text-brown">
            Total a pagar
          </span>
          <span className="font-display text-h2 font-bold text-crimson">
            {formatoPrecio.format(pedido.total)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {esOnline ? (
            <Link
              href={`/pedidos/${pedido.id}/pago`}
              className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-crimson px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-crimson-hover outline-none focus-visible:shadow-focus"
            >
              Pagar en línea {formatoPrecio.format(pedido.total)}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          ) : (
            <Link
              href="/menu"
              className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-crimson px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-crimson-hover outline-none focus-visible:shadow-focus"
            >
              Ver menú
            </Link>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={onNuevoPedido}
            className="flex-1"
          >
            Nuevo pedido
          </Button>
        </div>
      </div>
    </div>
  );
}

