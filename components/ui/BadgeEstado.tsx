import {
  Ban,
  Banknote,
  CalendarCheck,
  CalendarX,
  CheckCheck,
  CircleCheck,
  Clock,
  CreditCard,
  Flame,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type Estado =
  // Mesa
  | "LIBRE"
  | "OCUPADA"
  | "POR_LIMPIAR"
  // Línea / pedido
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "LISTO"
  | "ENTREGADO"
  // Reservación
  | "CONFIRMADA"
  | "CANCELADA"
  // Platillo
  | "DISPONIBLE"
  | "AGOTADO"
  // Pago
  | "PAGADO"
  | "COBRO_CAJA_PENDIENTE"
  | "PAGO_LINEA_PENDIENTE";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, { badge: string; icon: string }> = {
  success: { badge: "border-success bg-success/12", icon: "text-success" },
  warning: { badge: "border-warning bg-warning/12", icon: "text-warning" },
  danger: { badge: "border-danger bg-danger/12", icon: "text-danger" },
  info: { badge: "border-info bg-info/12", icon: "text-info" },
  neutral: { badge: "border-neutral bg-neutral/12", icon: "text-neutral" },
};

const estados: Record<Estado, { label: string; tone: Tone; Icon: LucideIcon }> = {
  LIBRE: { label: "Libre", tone: "success", Icon: CircleCheck },
  OCUPADA: { label: "Ocupada", tone: "danger", Icon: Users },
  POR_LIMPIAR: { label: "Por limpiar", tone: "warning", Icon: Sparkles },
  PENDIENTE: { label: "Pendiente", tone: "info", Icon: Clock },
  EN_PREPARACION: { label: "En preparación", tone: "warning", Icon: Flame },
  LISTO: { label: "Listo", tone: "success", Icon: CircleCheck },
  ENTREGADO: { label: "Entregado", tone: "neutral", Icon: CheckCheck },
  CONFIRMADA: { label: "Confirmada", tone: "success", Icon: CalendarCheck },
  CANCELADA: { label: "Cancelada", tone: "danger", Icon: CalendarX },
  DISPONIBLE: { label: "Disponible", tone: "success", Icon: CircleCheck },
  AGOTADO: { label: "Agotado", tone: "danger", Icon: Ban },
  PAGADO: { label: "Pagado", tone: "success", Icon: CircleCheck },
  COBRO_CAJA_PENDIENTE: { label: "Cobro en caja pendiente", tone: "warning", Icon: Banknote },
  PAGO_LINEA_PENDIENTE: { label: "Pago en línea pendiente", tone: "danger", Icon: CreditCard },
};

type BadgeEstadoProps = {
  estado: Estado;
  className?: string;
};

/** Estado = color + ícono + texto. El texto va en brown para cumplir contraste AA. */
export function BadgeEstado({ estado, className }: BadgeEstadoProps) {
  const { label, tone, Icon } = estados[estado];
  const classes = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-brown",
        classes.badge,
        className,
      )}
    >
      <Icon aria-hidden className={cn("size-4 shrink-0", classes.icon)} />
      {label}
    </span>
  );
}
