// «Nueva comanda» (FE-03).
// Mesas: lib/api/tables.ts. Menú: lib/api/salon-menu.ts. Ambos vienen del backend.
// SIGUE SIMULADO: createSalonOrder, hasta tener el contrato del endpoint de HU-06.

export type MesaStatus = "FREE" | "OCCUPIED" | "TO_CLEAN";

export type Mesa = {
  id: string;
  number: string; // el backend la envía como texto
  capacity: number;
  status: MesaStatus;
  selectable: boolean; // false si está por limpiar o su salón está inactivo
  hasOpenAccount: boolean; // el backend aún no lo informa: siempre false
};

export type SalonDish = {
  id: string;
  name: string;
  price: string; // dinero como texto, igual que el backend
  category: string;
  available: boolean;
};

export type SalonOrderLine = {
  dishId: string;
  quantity: number; // de 1 a 20
  note: string | null; // hasta 200 caracteres
};

export type SalonOrderInput = {
  tableId: string;
  tableNumber: string;
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

let siguienteNumeroPedido = 1042;

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// SIMULADO: no crea nada en el backend. Reemplazar por el endpoint real de HU-06
// (y conservar el manejo del 409 con el dishId del platillo agotado).
export async function createSalonOrder(input: SalonOrderInput): Promise<SalonOrderResult> {
  await esperar(800);
  const orderNumber = String(siguienteNumeroPedido++);
  return { orderNumber, tableNumber: input.tableNumber, lineCount: input.lines.length };
}

export function toCents(price: string): number {
  return Math.round(Number(price) * 100);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}