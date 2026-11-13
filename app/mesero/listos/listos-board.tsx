"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { MeseroFilaListo } from "@/components/business/MeseroFilaListo";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import type { KitchenOrder } from "@/lib/api/kitchen";
import { deliverOrder, refreshReadyOrders } from "./actions";

type ListosBoardProps = {
  initialOrders: KitchenOrder[];
  initialError?: string;
};

export function ListosBoard({ initialOrders, initialError }: ListosBoardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState(initialError ?? null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await refreshReadyOrders();
    if (result.ok) {
      setOrders(result.orders);
      setError(null);
    } else {
      setError(result.message);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function handleDeliver(orderId: string) {
    if (busyOrderId) return;
    setBusyOrderId(orderId);
    setError(null);
    const result = await deliverOrder(orderId);
    if (result.ok) {
      setOrders((current) => current.filter((order) => order.id !== orderId));
    } else {
      setError(result.message);
      void refresh();
    }
    setBusyOrderId(null);
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <h1 className="font-display text-h2 font-bold uppercase text-brown">Listos para entregar</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} · se actualiza cada 5 s
      </p>

      {error && (
        <Alerta tono="danger" className="mt-5">
          {error}
        </Alerta>
      )}

      {orders.length > 0 ? (
        <ul aria-label="Pedidos listos" className="mt-5 flex flex-col gap-4">
          {orders.map((order) => (
            <MeseroFilaListo
              key={order.id}
              order={order}
              busy={busyOrderId === order.id}
              onDeliver={handleDeliver}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-5">
          <EstadoVacio titulo="No hay pedidos listos" mensaje="Cuando cocina marque un pedido como listo, aparecerá aquí." />
          {error && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => void refresh()}>
                <RefreshCw aria-hidden className="size-5" />
                Reintentar
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}