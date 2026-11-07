export type ModalidadPago = "ONLINE" | "CAJA";

export type EstadoPedido =
  | "PENDIENTE_PAGO"
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "LISTO"
  | "ENTREGADO"
  | "CANCELADO";

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

