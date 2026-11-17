export type MesaStatus = "FREE" | "OCCUPIED" | "TO_CLEAN";

export type Mesa = {
  id: string;
  number: string; 
  capacity: number;
  status: MesaStatus;
  selectable: boolean; // false si está por limpiar o su salón está inactivo
  hasOpenAccount: boolean; // el backend aún no lo informa: siempre false
};

export type SalonDish = {
  id: string;
  name: string;
  price: string; 
  category: string;
  available: boolean;
};

export type SalonOrderLine = {
  dishId: string;
  quantity: number;
  note: string | null; 
};

export type SalonOrderInput = {
  tableId: string;
  operationKey: string;
  lines: SalonOrderLine[];
};

export type SalonOrderResult = {
  orderNumber: string;
  tableNumber: string;
  lineCount: number;
};

export class SalonApiError extends Error {
  readonly status: number;
  readonly dishId: string | null;

  constructor(status: number, message: string, dishId: string | null = null) {
    super(message);
    this.name = "SalonApiError";
    this.status = status;
    this.dishId = dishId;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function dishIdFrom(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.dishId === "string") return payload.dishId;
  if (Array.isArray(payload.dishIds) && typeof payload.dishIds[0] === "string") return payload.dishIds[0];
  return null;
}

function messageFrom(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.message === "string") return payload.message;
  if (Array.isArray(payload.message) && payload.message.every((item) => typeof item === "string")) {
    return payload.message.join(". ");
  }
  return null;
}


export async function createSalonOrder(token: string, input: SalonOrderInput): Promise<SalonOrderResult> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");

  const response = await fetch(new URL("orders/salon", apiUrl.replace(/\/?$/, "/")), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tableId: input.tableId,
      operationKey: input.operationKey,
      lines: input.lines.map((linea) => ({
        dishId: linea.dishId,
        quantity: linea.quantity,
        note: linea.note,
      })),
    }),
    cache: "no-store",
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new SalonApiError(response.status, messageFrom(payload) ?? `La API respondió ${response.status}.`, dishIdFrom(payload));
  }

  if (!isRecord(payload) || typeof payload.id !== "string" || !Array.isArray(payload.lines)) {
    throw new Error("La respuesta del pedido no tiene el formato esperado.");
  }

  return {
    
    orderNumber:
      typeof payload.orderNumber === "string" && payload.orderNumber ? payload.orderNumber : payload.id.slice(0, 8),
    tableNumber: typeof payload.tableNumber === "string" ? payload.tableNumber : "",
    lineCount: payload.lines.length,
  };
}

export function toCents(price: string): number {
  return Math.round(Number(price) * 100);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}