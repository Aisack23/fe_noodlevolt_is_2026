"use client";

import { useState } from "react";
import type { Pedido } from "@/lib/orders/types";
import { orderService } from "@/lib/orders/simulated-order-service";
import { CarritoView } from "./carrito-view";
import { ConfirmacionView } from "./confirmacion-view";

export function PedidosLlevarClient() {
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);

  const handleNuevoPedido = async () => {
    try {
      await orderService.limpiarUltimoPedido?.();
    } catch {
      // Ignorar fallo en almacenamiento local
    }
    setPedidoConfirmado(null);
  };

  if (pedidoConfirmado) {
    return (
      <main className="flex-1">
        <ConfirmacionView
          pedido={pedidoConfirmado}
          onNuevoPedido={handleNuevoPedido}
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <CarritoView onPedidoConfirmado={setPedidoConfirmado} />
    </main>
  );
}

