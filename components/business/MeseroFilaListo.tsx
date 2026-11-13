import { Button } from "@/components/ui/Button";
import type { KitchenOrder } from "@/lib/api/kitchen";

type MeseroFilaListoProps = {
  order: KitchenOrder;
  busy: boolean;
  onDeliver: (orderId: string) => void;
};

export function MeseroFilaListo({ order, busy, onDeliver }: MeseroFilaListoProps) {
  const numero = order.orderNumber ?? order.id.slice(0, 8);

  return (
    <li className="flex flex-col gap-4 rounded-card border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-h3 font-bold uppercase text-brown">Pedido #{numero}</h2>
        <ul className="mt-2 space-y-1 text-base text-brown">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity} × {item.name}
              {item.note && <span className="block text-sm text-text-secondary">Nota: {item.note}</span>}
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={() => onDeliver(order.id)} disabled={busy}>
        {busy ? "Entregando…" : "Entregado"}
      </Button>
    </li>
  );
}