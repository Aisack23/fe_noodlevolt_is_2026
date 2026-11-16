import type { Mesa, MesaStatus } from "@/lib/api/salon";

export class TablesApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`La API de mesas respondió ${status}.`);
    this.name = "TablesApiError";
    this.status = status;
  }
}

type BackendTableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE" | "NEEDS_CLEANING";

type BackendTable = {
  id: string;
  number: string;
  capacity: number;
  status: BackendTableStatus;
  room?: { id: string; name: string; isActive: boolean } | null;
};

const BACKEND_STATUSES: readonly string[] = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "OUT_OF_SERVICE",
  "NEEDS_CLEANING",
];

// RESERVED y OUT_OF_SERVICE no tienen diseño en Figma: por ahora no se muestran.
const STATUS_MAP: Partial<Record<BackendTableStatus, MesaStatus>> = {
  AVAILABLE: "FREE",
  OCCUPIED: "OCCUPIED",
  NEEDS_CLEANING: "TO_CLEAN",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBackendTable(value: unknown): value is BackendTable {
  if (!isRecord(value)) return false;
  const room = value.room;
  return (
    typeof value.id === "string" &&
    typeof value.number === "string" &&
    typeof value.capacity === "number" &&
    typeof value.status === "string" &&
    BACKEND_STATUSES.includes(value.status) &&
    (room === null || room === undefined || (isRecord(room) && typeof room.isActive === "boolean"))
  );
}

function toMesa(table: BackendTable): Mesa[] {
  const status = STATUS_MAP[table.status];
  if (!status) return [];
  const salonActivo = !table.room || table.room.isActive;
  return [
    {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status,
      selectable: status !== "TO_CLEAN" && salonActivo,
      hasOpenAccount: false,
    },
  ];
}

/** Debe invocarse en Server Components o Server Actions para resguardar el token. */
export async function getBranchTables(token: string, branchId: string): Promise<Mesa[]> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");

  const url = new URL(`branches/${encodeURIComponent(branchId)}/tables`, apiUrl.replace(/\/?$/, "/"));
  url.searchParams.set("limit", "100");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new TablesApiError(response.status);

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new Error("La respuesta de mesas no tiene el formato esperado.");
  }
  const items: unknown[] = payload.items;
  if (!items.every(isBackendTable)) {
    throw new Error("La respuesta de mesas no tiene el formato esperado.");
  }

  // El backend ordena el número como texto ("10" antes que "2"): se reordena numéricamente.
  return items
    .flatMap(toMesa)
    .sort((a, b) => a.number.localeCompare(b.number, "es", { numeric: true }));
}