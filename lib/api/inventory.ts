// SUPUESTO:  miestras no este la ruta (GET /api/v1/inventory).
// BE-05 puede devolver otros nombres, porque DB-05 reutiliza Ingredient y
// BranchIngredient. 
export type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  updatedAt: string; 
};

export type StockStatus = "SIN_STOCK" | "BAJO_MINIMO" | "SUFICIENTE";

// SUPUESTO: "Sin stock" es existencia 0; "Bajo mínimo" es igual o menor al mínimo.
export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.currentStock <= 0) return "SIN_STOCK";
  if (item.currentStock <= item.minimumStock) return "BAJO_MINIMO";
  return "SUFICIENTE";
}

// Datos de ejemplo inventados, mientras BE-05 no esté en develop.
export const sampleInventory: InventoryItem[] = [
  { id: "1", name: "Alga nori", unit: "hoja", currentStock: 40, minimumStock: 50, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "2", name: "Arroz", unit: "kg", currentStock: 60, minimumStock: 20, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "3", name: "Caldo tonkotsu", unit: "L", currentStock: 0, minimumStock: 10, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "4", name: "Camarón", unit: "kg", currentStock: 3, minimumStock: 8, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "5", name: "Cerdo molido", unit: "kg", currentStock: 25, minimumStock: 10, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "6", name: "Fideo ramen", unit: "kg", currentStock: 12, minimumStock: 12, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "7", name: "Huevo", unit: "pza", currentStock: 120, minimumStock: 60, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "8", name: "Masa gyoza", unit: "pza", currentStock: 200, minimumStock: 100, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "9", name: "Salsa de soya", unit: "L", currentStock: 15, minimumStock: 5, updatedAt: "2026-11-06T09:30:00-06:00" },
  { id: "10", name: "Tofu", unit: "kg", currentStock: 9, minimumStock: 10, updatedAt: "2026-11-06T09:30:00-06:00" },
];