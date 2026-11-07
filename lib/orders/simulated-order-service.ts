import type { IOrderService } from "./order-service";
import type {
  CrearPedidoInput,
  PedidoRegistradoResult,
  Pedido,
  ItemPedido,
  EstadoPedido,
} from "./types";

export class SimulatedOrderService implements IOrderService {
  async crearPedido(input: CrearPedidoInput): Promise<PedidoRegistradoResult> {
    // Simula una breve espera de respuesta para feedback visual realista
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!input.items || input.items.length === 0) {
      return {
        exito: false,
        error: "El carrito está vacío. Agrega productos antes de confirmar.",
      };
    }

    if (!input.sucursalId) {
      return {
        exito: false,
        error: "Debes seleccionar una sucursal válida.",
      };
    }

    // Calcula hora estimada de retiro (+20 minutos según supuesto S6)
    const fechaRetiro = new Date(Date.now() + 20 * 60 * 1000);
    const horaEstimadaRetiro = fechaRetiro.toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Código de pedido simulado (#A3F9-12C7 según referencia de Figma)
    const randomHex = () =>
      Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `#${randomHex()}-${randomHex()}`;
    const id = `ped-${Date.now()}`;

    // Estado inicial según la modalidad de pago
    // En línea: PENDING_PAYMENT (pasa a cocina cuando se apruebe el pago)
    // En caja: PENDING (pasa directamente a cocina)
    const estado: EstadoPedido =
      input.modalidadPago === "ONLINE" ? "PENDING_PAYMENT" : "PENDING";

    const items: ItemPedido[] = input.items.map((item) => ({
      platilloId: item.platilloId,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
      subtotal: item.precio * item.cantidad,
    }));

    const total = items.reduce((acc, curr) => acc + curr.subtotal, 0);

    const pedido: Pedido = {
      id,
      codigo,
      sucursalId: input.sucursalId,
      sucursalNombre: input.sucursalNombre,
      estado,
      modalidadPago: input.modalidadPago,
      items,
      total,
      fechaCreacion: new Date().toISOString(),
      horaEstimadaRetiro,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noodlevolt_last_order", JSON.stringify(pedido));
      } catch (e) {
        console.error("No se pudo guardar el pedido en almacenamiento local:", e);
      }
    }

    return {
      exito: true,
      pedido,
    };
  }

  async obtenerUltimoPedido(): Promise<Pedido | null> {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const stored = localStorage.getItem("noodlevolt_last_order");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  async limpiarUltimoPedido(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.removeItem("noodlevolt_last_order");
    } catch {
      // Ignorar errores en limpieza de storage
    }
  }
}

// Servicio activo en la aplicación (sustituible por ApiOrderService en el futuro)
export const orderService: IOrderService = new SimulatedOrderService();

