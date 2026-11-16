export type KitchenOrderStatus = "PENDING" | "IN_PREPARATION" | "READY";
export type KitchenNextStatus = "IN_PREPARATION" | "READY";

export type KitchenOrderItem = {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  status: string;
};

export type KitchenOrder = {
  id: string;
  orderNumber: string | null;
  type: string;
  status: KitchenOrderStatus;
  createdAt: string;
  items: KitchenOrderItem[];
};

export class KitchenApiError extends Error {
  readonly status: number;
  readonly serverMessage: string | null;

  constructor(status: number, serverMessage: string | null) {
    super(serverMessage ?? `La API respondió ${status}.`);
    this.name = "KitchenApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isKitchenOrderStatus(value: unknown): value is KitchenOrderStatus {
  return value === "PENDING" || value === "IN_PREPARATION" || value === "READY";
}

function isKitchenOrder(value: unknown): value is KitchenOrder {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (typeof value.orderNumber === "string" || value.orderNumber === null) &&
    typeof value.type === "string" &&
    isKitchenOrderStatus(value.status) &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        (typeof item.note === "string" || item.note === null) &&
        typeof item.status === "string",
    )
  );
}

async function messageFrom(response: Response): Promise<string | null> {
  const payload: unknown = await response.json().catch(() => null);
  if (!isRecord(payload)) return null;
  if (typeof payload.message === "string") return payload.message;
  if (Array.isArray(payload.message) && payload.message.every((message) => typeof message === "string")) {
    return payload.message.join(". ");
  }
  return null;
}

function apiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");
  return apiUrl.replace(/\/?$/, "/");
}

/** Operaciones de cocina. Deben invocarse en Server Components o Server Actions para resguardar el token. */
export async function getKitchenOrders(token: string): Promise<KitchenOrder[]> {
  const response = await fetch(new URL("kitchen/orders", apiBaseUrl()), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new KitchenApiError(response.status, await messageFrom(response));

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isKitchenOrder)) {
    throw new Error("La respuesta de la cola de cocina no tiene el formato esperado.");
  }
  return payload;
}

export async function updateKitchenOrderStatus(
  token: string,
  orderId: string,
  status: KitchenNextStatus,
): Promise<KitchenOrder> {
  const response = await fetch(new URL(`kitchen/orders/${orderId}/status`, apiBaseUrl()), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
    cache: "no-store",
  });
  if (!response.ok) throw new KitchenApiError(response.status, await messageFrom(response));

  const payload: unknown = await response.json();
  if (!isKitchenOrder(payload)) {
    throw new Error("La respuesta de actualización de cocina no tiene el formato esperado.");
  }
  return payload;
}

export async function getReadyKitchenOrders(token: string): Promise<KitchenOrder[]> {
  const response = await fetch(new URL("kitchen/orders/ready", apiBaseUrl()), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new KitchenApiError(response.status, await messageFrom(response));

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isKitchenOrder)) {
    throw new Error("La respuesta de pedidos listos no tiene el formato esperado.");
  }
  return payload;
}

export async function deliverKitchenOrder(token: string, orderId: string): Promise<void> {
  const response = await fetch(new URL(`kitchen/orders/${orderId}/deliver`, apiBaseUrl()), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new KitchenApiError(response.status, await messageFrom(response));
}