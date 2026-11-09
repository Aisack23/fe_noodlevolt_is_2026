/** Tipos y acceso al contrato FE-08 de pedidos, reseñas y calificación de sucursal. */

export const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: "Pago pendiente",
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_PREPARATION: "En preparación",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;

export type OrderReview = {
  id: string;
  rating: number;
};

export type CustomerOrder = {
  id: string;
  /** Puede ser null para pedidos creados sin folio comercial asignado. */
  orderNumber: string | null;
  status: OrderStatus;
  /** Importe de presentación; se conserva como string para evitar cálculos/redondeos. */
  total: string;
  createdAt: string;
  branchId: string;
  branchName: string;
  review: OrderReview | null;
};

/** Única regla de visibilidad para habilitar una reseña en la interfaz. */
export function canRateOrder(order: Pick<CustomerOrder, "status" | "review">): boolean {
  return order.status === "DELIVERED" && order.review === null;
}

export type CreateReviewInput = {
  orderId: string;
  rating: number;
  comment?: string;
};

export type BranchRating = {
  average: number | null;
  count: number;
};

export type ApiErrorMessage = string | string[] | null;
export type ReviewApiErrorKind = "unauthorized" | "forbidden" | "conflict" | "validation" | "not_found" | "http";

/** Conserva el status y el mensaje original para que la UI maneje 400/401/403/409. */
export class ReviewApiError extends Error {
  readonly status: number;
  readonly serverMessage: ApiErrorMessage;
  readonly kind: ReviewApiErrorKind;

  constructor(status: number, serverMessage: ApiErrorMessage) {
    const message = Array.isArray(serverMessage)
      ? serverMessage.join(". ")
      : serverMessage ?? `La API respondió ${status}.`;
    super(message);
    this.name = "ReviewApiError";
    this.status = status;
    this.serverMessage = serverMessage;
    this.kind =
      status === 401 ? "unauthorized" :
      status === 403 ? "forbidden" :
      status === 409 ? "conflict" :
      status === 400 ? "validation" :
      status === 404 ? "not_found" :
      "http";
  }
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }
  return apiUrl.replace(/\/?$/, "/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && Object.hasOwn(ORDER_STATUS_LABELS, value);
}

function isOrderReview(value: unknown): value is OrderReview {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.rating === "number" &&
    Number.isInteger(value.rating) &&
    value.rating >= 1 &&
    value.rating <= 5
  );
}

function isCustomerOrder(value: unknown): value is CustomerOrder {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (typeof value.orderNumber === "string" || value.orderNumber === null) &&
    isOrderStatus(value.status) &&
    typeof value.total === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.branchId === "string" &&
    typeof value.branchName === "string" &&
    (value.review === null || isOrderReview(value.review))
  );
}

function isBranchRating(value: unknown): value is BranchRating {
  return (
    isRecord(value) &&
    (value.average === null || typeof value.average === "number") &&
    typeof value.count === "number" &&
    Number.isInteger(value.count) &&
    value.count >= 0
  );
}

async function serverMessageFrom(response: Response): Promise<ApiErrorMessage> {
  const payload: unknown = await response.json().catch(() => null);
  if (!isRecord(payload)) return null;
  const message = payload.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.every((item: unknown) => typeof item === "string")) {
    return message;
  }
  return null;
}

async function assertOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new ReviewApiError(response.status, await serverMessageFrom(response));
  }
}

function authorizationHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET /orders/me?status=... — el total se conserva como string del servidor. */
export async function getMyOrders(
  token: string,
  status?: OrderStatus,
): Promise<CustomerOrder[]> {
  const url = new URL("orders/me", getApiBaseUrl());
  if (status) url.searchParams.set("status", status);

  const response = await fetch(url, {
    headers: authorizationHeaders(token),
    cache: "no-store",
  });
  await assertOk(response);

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isCustomerOrder)) {
    throw new Error("La respuesta de pedidos no tiene el formato esperado.");
  }
  return data;
}

/** POST /reviews — no acepta ni envía customerId o branchId. */
export async function createReview(
  token: string,
  input: CreateReviewInput,
): Promise<void> {
  const body: CreateReviewInput = {
    orderId: input.orderId,
    rating: input.rating,
    ...(input.comment !== undefined ? { comment: input.comment } : {}),
  };
  const response = await fetch(new URL("reviews", getApiBaseUrl()), {
    method: "POST",
    headers: {
      ...authorizationHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  await assertOk(response);
}

/** GET /branches/:id/rating — endpoint público. */
export async function getBranchRating(branchId: string): Promise<BranchRating> {
  const response = await fetch(
    new URL(`branches/${encodeURIComponent(branchId)}/rating`, getApiBaseUrl()),
    { cache: "no-store" },
  );
  await assertOk(response);

  const data: unknown = await response.json();
  if (!isBranchRating(data)) {
    throw new Error("La respuesta de calificación de sucursal no tiene el formato esperado.");
  }
  return data;
}
