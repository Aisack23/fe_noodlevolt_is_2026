import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BadgeEstado, type Estado } from "@/components/ui/BadgeEstado";
import { CocinaLineaPedido } from "@/components/business/CocinaLineaPedido";
import type { KitchenNextStatus, KitchenOrder, KitchenOrderStatus } from "@/lib/api/kitchen";
import { cn } from "@/lib/cn";

type CocinaTarjetaPedidoProps = {
  order: KitchenOrder;
  busy: boolean;
  onTransition: (orderId: string, status: KitchenNextStatus) => void;
};

const statusToBadge: Record<KitchenOrderStatus, Estado> = {
  PENDING: "PENDIENTE",
  IN_PREPARATION: "EN_PREPARACION",
  READY: "LISTO",
};

const statusBorder: Record<KitchenOrderStatus, string> = {
  PENDING: "border-info",
  IN_PREPARATION: "border-warning",
  READY: "border-success",
};

function formatOrderType(type: string): string {
  if (type === "DINE_IN" || type === "TABLE") return "Mesa";
  if (type === "TAKEAWAY" || type === "TAKE_OUT") return "Para llevar";
  return type;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hora no disponible";
  return new Intl.DateTimeFormat("es-SV", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/El_Salvador",
  }).format(date);
}

export function CocinaTarjetaPedido({ order, busy, onTransition }: CocinaTarjetaPedidoProps) {
  const nextStatus: KitchenNextStatus | null =
    order.status === "PENDING" ? "IN_PREPARATION" : order.status === "IN_PREPARATION" ? "READY" : null;
  const actionLabel = nextStatus === "IN_PREPARATION" ? "Iniciar" : "Listo";

  return (
    <article className={cn("flex min-w-[280px] flex-1 flex-col overflow-hidden rounded-card border-2 bg-white", statusBorder[order.status])}>
      <header className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-h3 font-bold uppercase text-brown">
            #{order.orderNumber ?? "—"}
          </h2>
          <BadgeEstado estado={statusToBadge[order.status]} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-4" />{formatOrderType(order.type)}</span>
          <span className="inline-flex items-center gap-1"><Clock aria-hidden className="size-4" />{formatCreatedAt(order.createdAt)}</span>
        </div>
      </header>
      <ul className="flex-1" aria-label={`Platillos del pedido ${order.orderNumber ?? order.id}`}>
        {order.items.map((item) => <CocinaLineaPedido key={item.id} item={item} orderStatus={order.status} />)}
      </ul>
      {nextStatus && (
        <div className="border-t border-border p-4">
          <Button
            variant={nextStatus === "READY" ? "primary" : "secondary"}
            loading={busy}
            loadingText="Actualizando…"
            className="w-full"
            onClick={() => onTransition(order.id, nextStatus)}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </article>
  );
}
