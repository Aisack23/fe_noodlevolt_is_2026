// Tipos para los reportes del backend
export interface SalesReportResponse {
  from: string;
  to: string;
  branchId: string | null;
  total: string;
  paymentsCount: number;
}

export interface TopDish {
  dishId: string;
  dishName: string;
  quantity: number;
}

export interface TopDishesReportResponse {
  from: string;
  to: string;
  branchId: string | null;
  dishes: TopDish[];
}

export class ReportsApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ReportsApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isSalesReport(value: unknown): value is SalesReportResponse {
  return (
    isRecord(value) &&
    isIsoDate(value.from) &&
    isIsoDate(value.to) &&
    (typeof value.branchId === "string" || value.branchId === null) &&
    typeof value.total === "string" &&
    typeof value.paymentsCount === "number" &&
    Number.isInteger(value.paymentsCount) &&
    value.paymentsCount >= 0
  );
}

function isTopDish(value: unknown): value is TopDish {
  return (
    isRecord(value) &&
    typeof value.dishId === "string" &&
    typeof value.dishName === "string" &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity >= 0
  );
}

function isTopDishesReport(value: unknown): value is TopDishesReportResponse {
  return (
    isRecord(value) &&
    isIsoDate(value.from) &&
    isIsoDate(value.to) &&
    (typeof value.branchId === "string" || value.branchId === null) &&
    Array.isArray(value.dishes) &&
    value.dishes.every(isTopDish)
  );
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");
  return apiUrl.replace(/\/?$/, "/");
}

function authorizationHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET /api/v1/reports/sales
 * Roles permitidos: BRANCH_ADMIN, GENERAL_MANAGER
 * Parámetros obligatorios: from, to
 * Parámetro opcional: branchId
 */
export async function getSalesReport(
  token: string,
  params: { from: string; to: string; branchId?: string },
): Promise<SalesReportResponse> {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  if (params.branchId) {
    qs.set("branchId", params.branchId);
  }

  const response = await fetch(
    new URL(`reports/sales?${qs.toString()}`, getApiBaseUrl()),
    {
      headers: authorizationHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ReportsApiError(
      `Error al cargar el reporte de ventas (${response.status}).`,
      response.status,
    );
  }

  const data: unknown = await response.json();
  if (!isSalesReport(data)) {
    throw new Error("La respuesta del reporte de ventas no tiene el formato esperado.");
  }

  return data;
}

/**
 * GET /api/v1/reports/top-dishes
 * Roles permitidos: BRANCH_ADMIN, GENERAL_MANAGER
 * Parámetros obligatorios: from, to
 * Parámetros opcionales: branchId, limit (1-100, default 10)
 */
export async function getTopDishesReport(
  token: string,
  params: { from: string; to: string; branchId?: string; limit?: number },
): Promise<TopDishesReportResponse> {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  if (params.branchId) {
    qs.set("branchId", params.branchId);
  }
  if (params.limit !== undefined) {
    const clamped = Math.max(1, Math.min(100, Math.trunc(params.limit)));
    qs.set("limit", String(clamped));
  }

  const response = await fetch(
    new URL(`reports/top-dishes?${qs.toString()}`, getApiBaseUrl()),
    {
      headers: authorizationHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ReportsApiError(
      `Error al cargar el reporte de platillos (${response.status}).`,
      response.status,
    );
  }

  const data: unknown = await response.json();
  if (!isTopDishesReport(data)) {
    throw new Error("La respuesta del reporte de platillos no tiene el formato esperado.");
  }

  return data;
}
