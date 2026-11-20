import { MessageSquare } from "lucide-react";
import { BadgeEstado, type Estado } from "@/components/ui/BadgeEstado";
import type { KitchenOrderItem, KitchenOrderStatus } from "@/lib/api/kitchen";

type CocinaLineaPedidoProps = {
  item: KitchenOrderItem;
  orderStatus: KitchenOrderStatus;
};

const statusToBadge: Record<KitchenOrderStatus, Estado> = {
  PENDING: "PENDIENTE",
  IN_PREPARATION: "EN_PREPARACION",
  READY: "LISTO",
};

export function CocinaLineaPedido({ item, orderStatus }: CocinaLineaPedidoProps) {
  return (
    <li className="border-t border-border px-4 py-4 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[24px] font-semibold leading-8 text-brown">
          {item.quantity} × {item.name}
        </p>
        <BadgeEstado estado={statusToBadge[orderStatus]} className="shrink-0" />
      </div>
      {item.note ? (
        <p className="mt-3 flex items-start gap-2 rounded-control border-l-4 border-orange bg-cream px-3 py-2 text-base font-medium text-brown">
          <MessageSquare aria-hidden className="mt-0.5 size-5 shrink-0" />
          {item.note}
        </p>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">Sin observaciones</p>
      )}
    </li>
  );
}
