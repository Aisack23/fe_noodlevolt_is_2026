"use client";

import Image from "next/image";
import { Trash2, Utensils } from "lucide-react";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import type { CartItem } from "@/lib/cart/cart-context";

const formatoPrecio = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type CarritoItemProps = {
  item: CartItem;
  onIncrementar: () => void;
  onDisminuir: () => void;
  onEliminar: () => void;
};

export function CarritoItem({
  item,
  onIncrementar,
  onDisminuir,
  onEliminar,
}: CarritoItemProps) {
  const subtotal = item.precio * item.cantidad;

  return (
    <article className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-card border border-border bg-white p-4 transition-all hover:border-orange/60">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center overflow-hidden rounded-control bg-cream">
          {item.imagenUrl ? (
            <Image
              src={item.imagenUrl}
              alt={item.nombre}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <Utensils aria-hidden className="size-8 text-brown/40" />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-brown">
            {item.nombre}
          </h3>
          <span className="text-sm text-text-secondary">
            Precio unitario: {formatoPrecio.format(item.precio)}
          </span>
          <span className="text-sm font-semibold text-crimson sm:hidden mt-1">
            Subtotal: {formatoPrecio.format(subtotal)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/40 pt-3 sm:border-0 sm:pt-0">
        <CantidadStepper
          cantidad={item.cantidad}
          onIncrementar={onIncrementar}
          onDisminuir={onDisminuir}
          ariaLabel={`Cantidad de ${item.nombre}`}
        />

        <div className="hidden sm:flex flex-col items-end min-w-24">
          <span className="text-xs text-text-secondary uppercase">Subtotal</span>
          <span className="font-display text-lg font-bold text-brown">
            {formatoPrecio.format(subtotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={onEliminar}
          aria-label={`Eliminar ${item.nombre} del carrito`}
          className="inline-flex size-10 items-center justify-center rounded-control text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors outline-none focus-visible:shadow-focus"
        >
          <Trash2 aria-hidden className="size-5" />
        </button>
      </div>
    </article>
  );
}

