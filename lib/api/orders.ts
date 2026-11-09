import type { Pedido, EstadoPedido, ModalidadPago } from "@/lib/orders/types";

export type CreateOrderRequest = {
  branchId: string;
  operationKey: string;
  paymentMode: "ONLINE" | "AT_COUNTER";
  lines: Array<{
    dishId: string;
    quantity: number;
    expectedPrice?: string;
  }>;
};

type OrderLineResponse = {
  dishId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

export type OrderResponse = {
  id: string;
  branchId: string;
  operationKey: string;
  status: EstadoPedido;
  total: string;
  paymentMode: "ONLINE" | "AT_COUNTER" | null;
  pickupAt: string | null;
  lines: OrderLineResponse[];
};

export type ApiErrorMessage = string | string[] | null;

export class OrderApiError extends Error {
  readonly status: number;
  readonly serverMessage: ApiErrorMessage;

  constructor(status: number, serverMessage: ApiErrorMessage) {
    super(
      Array.isArray(serverMessage)
        ? serverMessage.join(". ")
        : serverMessage ?? `La API respondió ${status}.`,
    );
    this.name = "OrderApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

const orderStatuses = new Set<EstadoPedido>([
  "PENDING_PAYMENT",
  "PENDING",
  "CONFIRMED",
  "IN_PREPARATION",
  "READY",
  "DELIVERED",
  "CANCELED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOrderResponse(value: unknown): value is OrderResponse {
  if (!isRecord(value) || !Array.isArray(value.lines)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.branchId === "string" &&
    typeof value.operationKey === "string" &&
    typeof value.status === "string" &&
    orderStatuses.has(value.status as EstadoPedido) &&
    typeof value.total === "string" &&
    (value.paymentMode === "ONLINE" || value.paymentMode === "AT_COUNTER" || value.paymentMode === null) &&
    (typeof value.pickupAt === "string" || value.pickupAt === null) &&
    value.lines.every(
      (line) =>
        isRecord(line) &&
        typeof line.dishId === "string" &&
        typeof line.name === "string" &&
        typeof line.quantity === "number" &&
        Number.isInteger(line.quantity) &&
        typeof line.unitPrice === "string" &&
        typeof line.subtotal === "string",
    )
  );
}

async function messageFrom(response: Response): Promise<ApiErrorMessage> {
  const payload: unknown = await response.json().catch(() => null);
  if (!isRecord(payload)) return null;
  const { message } = payload;
  if (typeof message === "string" ||
      (Array.isArray(message) && message.every((item) => typeof item === "string"))) {
    return message;
  }
  if (isRecord(message) && typeof message.message === "string") {
    return message.message;
  }
  return null;
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");
  return apiUrl.replace(/\/?$/, "/");
}

/** POST /orders. Solo se invoca desde una Server Action para no exponer el token. */
export async function createOrder(token: string, input: CreateOrderRequest): Promise<OrderResponse> {
  const response = await fetch(new URL("orders", getApiBaseUrl()), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new OrderApiError(response.status, await messageFrom(response));
  }

  const payload: unknown = await response.json();
  if (!isOrderResponse(payload)) {
    throw new Error("La respuesta de creación del pedido no tiene el formato esperado.");
  }
  return payload;
}

export function mapOrderResponseToPedido(
  response: OrderResponse,
  branchName: string,
): Pedido {
  const paymentMode: ModalidadPago =
    response.paymentMode === "AT_COUNTER" ? "CAJA" : "ONLINE";
  const pickupDate = response.pickupAt ? new Date(response.pickupAt) : null;
  const horaEstimadaRetiro =
    pickupDate && !Number.isNaN(pickupDate.getTime())
      ? pickupDate.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "Por confirmar";

  return {
    id: response.id,
    codigo: response.id,
    sucursalId: response.branchId,
    sucursalNombre: branchName,
    estado: response.status,
    modalidadPago: paymentMode,
    items: response.lines.map((line) => ({
      platilloId: line.dishId,
      nombre: line.name,
      precio: Number(line.unitPrice),
      cantidad: line.quantity,
      subtotal: Number(line.subtotal),
    })),
    total: Number(response.total),
    fechaCreacion: new Date().toISOString(),
    horaEstimadaRetiro,
  };
}
