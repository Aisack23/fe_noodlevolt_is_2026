import type { CrearPedidoInput, Pedido, PedidoRegistradoResult } from "./types";

export interface IOrderService {
  crearPedido(input: CrearPedidoInput): Promise<PedidoRegistradoResult>;
  obtenerUltimoPedido?(): Promise<Pedido | null>;
  limpiarUltimoPedido?(): Promise<void>;
}

