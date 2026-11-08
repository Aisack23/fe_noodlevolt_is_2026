// Contrato real: GET /api/v1/inventory (docs/decisiones/inventario-consulta.md del backend,
// rama feat/be-05-inventario-bajo-stock). Las cantidades llegan como números.
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

// SUPUESTO: la API solo entrega isLowStock. "Sin stock" (existencia 0) lo distingue el
// frontend, porque el Figma muestra tres estados. Confirmar con quien hizo BE-05.
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

// Todavía sin usar: BE-05 aún no está en develop. El token es el de la sesión del gerente.
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

// Datos de ejemplo tomados del Figma, mientras BE-05 no esté en develop.
function sample(
  id: string,
  name: string,
  unit: string,
  currentStock: number,
  minimumStock: number,
): InventoryItem {
  return {
    id,
    branchId: "10000000-0000-4000-8000-000000000002",
    branchName: "NoodleVolt Santa Tecla",
    name,
    unit,
    currentStock,
    minimumStock,
    isLowStock: currentStock <= minimumStock,
    updatedAt: "2026-11-06T15:30:00.000Z",
  };
}

export const sampleInventory: InventoryItem[] = [
  sample("1", "Alga nori", "hoja", 120, 40),
  sample("2", "Arroz", "kg", 25, 20),
  sample("3", "Caldo tonkotsu", "L", 5, 12),
  sample("4", "Camarón", "kg", 2, 4),
  sample("5", "Cerdo molido", "kg", 3, 5),
  sample("6", "Fideo ramen", "kg", 4, 10),
  sample("7", "Huevo", "pza", 0, 30),
  sample("8", "Masa gyoza", "pza", 0, 50),
  sample("9", "Salsa de soya", "L", 8, 6),
  sample("10", "Tofu", "kg", 9, 3),
];