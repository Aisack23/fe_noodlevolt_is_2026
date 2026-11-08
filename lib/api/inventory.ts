export type InventoryItem = {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  isLowStock: boolean;
  updatedAt: string; // ISO 8601, UTC
};

export type StockStatus = "SIN_STOCK" | "BAJO_MINIMO" | "SUFICIENTE";

export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.currentStock <= 0) return "SIN_STOCK";
  return item.isLowStock ? "BAJO_MINIMO" : "SUFICIENTE";
}

export class InventoryApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`El inventario respondió ${status}`);
    this.status = status;
  }
}

// Conectado al endpoint real de BE-05 en develop. El token es el de la sesión del gerente.
export async function getInventory(token: string): Promise<InventoryItem[]> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const res = await fetch(new URL("inventory", apiUrl.replace(/\/?$/, "/")), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new InventoryApiError(res.status);
  }

  return res.json();
}