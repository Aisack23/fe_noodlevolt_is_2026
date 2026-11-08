import type { Estado } from "@/components/ui/BadgeEstado";

export type ModalidadPago = "ONLINE" | "CAJA";

export type EstadoPedido =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "READY"
  | "DELIVERED"
  | "CANCELED";

export const ESTADO_PEDIDO_A_BADGE = {
  PENDING_PAYMENT: "PAGO_LINEA_PENDIENTE",
  PENDING: "PENDIENTE",
  CONFIRMED: "CONFIRMADA",
  IN_PREPARATION: "EN_PREPARACION",
  READY: "LISTO",
  DELIVERED: "ENTREGADO",
  CANCELED: "CANCELADA",
} as const satisfies Record<EstadoPedido, Estado>;

export function mapearEstadoPedidoABadge(estado: EstadoPedido): Estado {
  return ESTADO_PEDIDO_A_BADGE[estado];
}

export type ItemPedido = {
  platilloId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
};

export type Pedido = {
  id: string;
  codigo: string;
  sucursalId: string;
  sucursalNombre: string;
  estado: EstadoPedido;
  modalidadPago: ModalidadPago;
  items: ItemPedido[];
  total: number;
  fechaCreacion: string;
  horaEstimadaRetiro: string;
};

export type CrearPedidoInput = {
  sucursalId: string;
  sucursalNombre: string;
  modalidadPago: ModalidadPago;
  items: Array<{
    platilloId: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
};

export type PedidoRegistradoResult = {
  exito: boolean;
  pedido?: Pedido;
  error?: string;
};
