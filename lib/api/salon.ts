// DATOS DE PRUEBA para la pantalla «Nueva comanda» (FE-03).
// TODO: reemplazar el contenido de estas funciones por llamadas reales al backend
// cuando existan los endpoints de mesas y de pedidos de salón.
// Datos tomados de los frames de Figma.

export type MesaStatus = "FREE" | "OCCUPIED" | "TO_CLEAN";

export type Mesa = {
  id: string;
  number: number;
  capacity: number;
  status: MesaStatus;
  hasOpenAccount: boolean;
};

export type MenuCategory = "Entradas" | "Platos fuertes" | "Bebidas";

export type SalonDish = {
  id: string;
  name: string;
  price: string; // dinero como texto con 2 decimales, igual que el backend
  category: MenuCategory;
  available: boolean;
};

export type SalonOrderLine = {
  dishId: string;
  quantity: number; // de 1 a 20
  note: string | null; // hasta 200 caracteres
};

export type SalonOrderInput = {
  tableId: string;
  operationKey: string;
  lines: SalonOrderLine[];
};

export type SalonOrderResult = {
  orderNumber: string;
  tableNumber: number;
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

const mesas: Mesa[] = [
  { id: "mesa-1", number: 1, capacity: 2, status: "FREE", hasOpenAccount: false },
  { id: "mesa-2", number: 2, capacity: 4, status: "OCCUPIED", hasOpenAccount: true },
  { id: "mesa-3", number: 3, capacity: 4, status: "FREE", hasOpenAccount: false },
  { id: "mesa-4", number: 4, capacity: 6, status: "TO_CLEAN", hasOpenAccount: false },
  { id: "mesa-5", number: 5, capacity: 2, status: "OCCUPIED", hasOpenAccount: true },
  { id: "mesa-6", number: 6, capacity: 8, status: "FREE", hasOpenAccount: false },
];

const platillos: SalonDish[] = [
  { id: "dish-ramen", name: "Ramen tonkotsu", price: "8.50", category: "Platos fuertes", available: true },
  { id: "dish-yakisoba", name: "Yakisoba de pollo", price: "7.25", category: "Platos fuertes", available: true },
  { id: "dish-gyozas", name: "Gyozas de cerdo (6)", price: "5.50", category: "Entradas", available: true },
  { id: "dish-te", name: "Té helado", price: "2.00", category: "Bebidas", available: true },
];

let siguienteNumeroPedido = 1042;

function esperar(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMesas(): Promise<Mesa[]> {
  await esperar();
  return mesas.map((mesa) => ({ ...mesa }));
}

export async function getSalonMenu(): Promise<SalonDish[]> {
  await esperar();
  return platillos.map((platillo) => ({ ...platillo }));
}

export async function markMesaClean(tableId: string): Promise<void> {
  await esperar();
  const mesa = mesas.find((item) => item.id === tableId);
  if (!mesa) throw new SalonApiError(404, "La mesa no existe.");
  if (mesa.status !== "TO_CLEAN") throw new SalonApiError(409, "La mesa no está por limpiar.");
  mesa.status = "FREE";
}

export async function createSalonOrder(input: SalonOrderInput): Promise<SalonOrderResult> {
  await esperar(800);
  const mesa = mesas.find((item) => item.id === input.tableId);
  if (!mesa) throw new SalonApiError(404, "La mesa no existe.");

  // Simula un platillo que se agota justo al enviar (frame «No se pudo enviar el pedido»):
  // las Gyozas responden 409 la primera vez y desde entonces el menú las muestra agotadas.
  const agotado = input.lines.find(
    (linea) =>
      linea.dishId === "dish-gyozas" ||
      platillos.find((platillo) => platillo.id === linea.dishId)?.available === false,
  );
  if (agotado) {
    const platillo = platillos.find((item) => item.id === agotado.dishId);
    if (platillo) platillo.available = false;
    throw new SalonApiError(409, "Un platillo ya no está disponible.", agotado.dishId);
  }

  mesa.status = "OCCUPIED";
  mesa.hasOpenAccount = true;
  const orderNumber = String(siguienteNumeroPedido++);
  return { orderNumber, tableNumber: mesa.number, lineCount: input.lines.length };
}

export function toCents(price: string): number {
  return Math.round(Number(price) * 100);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}