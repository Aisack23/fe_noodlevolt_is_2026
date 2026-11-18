import type { ApiErrorMessage } from "./orders";

// ---------------------------------------------------------------------------
// Tipos y DTOs del contrato BE-04: Reservations & Dining Tables
// ---------------------------------------------------------------------------

/** DTO de entrada para crear una reservación (POST /reservations). */
export interface CreateReservationDto {
  branchId: string;
  tableId?: string;
  startsAt: string; // ISO 8601 con Z u offset explícito
  guests: number;
  contactName: string;
  phone: string;
}

/** DTO de respuesta para una reservación creada (POST /reservations). */
export interface ReservationResponseDto {
  id: string;
  branchId: string;
  tableId: string;
  guests: number;
  startsAt: string;
  endsAt: string;
  status: "CONFIRMED";
}

/** Modelo de reservación para listados de gerencia. */
export interface ReservationItem {
  id: string;
  code?: string;
  branchId: string;
  tableId?: string;
  tableNumber?: string;
  guests: number;
  contactName: string;
  phone: string;
  startsAt: string; // ISO 8601
  endsAt: string;   // ISO 8601
  status: "CONFIRMED" | "CANCELLED";
}

/** DTO de salón de comedor (Dining Room). */
export interface DiningRoomDto {
  id: string;
  name: string;
  isActive: boolean;
}

/** DTO de mesa de comedor (Dining Table). */
export interface DiningTableResponseDto {
  id: string;
  branchId: string;
  number: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "OUT_OF_SERVICE" | "RESERVED";
  roomId: string | null;
  room?: DiningRoomDto | null;
}

export interface DiningTablesResponseDto {
  total: number;
  page: number;
  limit: number;
  items: DiningTableResponseDto[];
}

// ---------------------------------------------------------------------------
// Error tipado para operaciones de reservaciones y mesas
// ---------------------------------------------------------------------------

export class ReservationApiError extends Error {
  readonly status: number;
  readonly serverMessage: ApiErrorMessage;

  constructor(status: number, serverMessage: ApiErrorMessage) {
    super(
      Array.isArray(serverMessage)
        ? serverMessage.join(". ")
        : serverMessage ?? `La API de reservaciones respondió ${status}.`,
    );
    this.name = "ReservationApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// ---------------------------------------------------------------------------
// Helpers de validación y URL
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function messageFrom(response: Response): Promise<ApiErrorMessage> {
  const payload: unknown = await response.json().catch(() => null);
  if (!isRecord(payload)) return null;
  const { message } = payload;
  if (
    typeof message === "string" ||
    (Array.isArray(message) && message.every((item) => typeof item === "string"))
  ) {
    return message;
  }
  if (isRecord(message) && typeof message.message === "string") {
    return message.message;
  }
  return null;
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");
  return apiUrl.replace(/\/?$/, "/");
}

// ---------------------------------------------------------------------------
// Llamadas al Backend (BE-04)
// ---------------------------------------------------------------------------

/**
 * POST /reservations
 * Reserva una mesa disponible durante 90 minutos para un CLIENT.
 */
export async function createReservation(
  token: string,
  input: CreateReservationDto,
): Promise<ReservationResponseDto> {
  const response = await fetch(new URL("reservations", getApiBaseUrl()), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ReservationApiError(response.status, await messageFrom(response));
  }

  const payload: unknown = await response.json();
  if (
    !isRecord(payload) ||
    typeof payload.id !== "string" ||
    typeof payload.branchId !== "string" ||
    typeof payload.tableId !== "string" ||
    typeof payload.guests !== "number" ||
    typeof payload.startsAt !== "string"
  ) {
    throw new Error("La respuesta de la reservación no tiene el formato esperado.");
  }

  return payload as unknown as ReservationResponseDto;
}

/**
 * GET /branches/:branchId/tables
 * Consulta las mesas de una sucursal física.
 */
export async function getBranchTables(
  token: string,
  branchId: string,
): Promise<DiningTableResponseDto[]> {
  const url = new URL(`branches/${encodeURIComponent(branchId)}/tables`, getApiBaseUrl());
  url.searchParams.set("limit", "100");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ReservationApiError(response.status, await messageFrom(response));
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new Error("La respuesta de mesas no tiene el formato esperado.");
  }

  return payload.items as DiningTableResponseDto[];
}

/**
 * GET /branches/:branchId/reservations?date=YYYY-MM-DD
 * Consulta las reservaciones para una fecha específica en una sucursal.
 * Si el endpoint no existe en el backend actual, maneja 404/501 de forma controlada.
 */
export async function getBranchReservations(
  token: string,
  branchId: string,
  date: string,
): Promise<ReservationItem[]> {
  const url = new URL(`reservations/branches/${encodeURIComponent(branchId)}/reservations`, getApiBaseUrl());
  url.searchParams.set("date", date);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ReservationApiError(response.status, await messageFrom(response));
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    if (isRecord(payload) && Array.isArray(payload.items)) {
      return payload.items as ReservationItem[];
    }
    throw new Error("La respuesta de reservaciones no tiene el formato esperado.");
  }

  return payload as ReservationItem[];
}
/**
 * GET /reservations/availability?branchId=...&startsAt=...&guests=...
 * Consulta las mesas disponibles para un horario y capacidad específicos.
 */
export async function getAvailableTablesForBooking(
  token: string,
  branchId: string,
  startsAt: string,
  guests: number,
): Promise<DiningTableResponseDto[]> {
  const url = new URL("reservations/availability", getApiBaseUrl());
  url.searchParams.set("branchId", branchId);
  url.searchParams.set("startsAt", startsAt);
  url.searchParams.set("guests", guests.toString());

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ReservationApiError(response.status, await messageFrom(response));
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("La respuesta de mesas disponibles no tiene el formato esperado.");
  }

  return payload as DiningTableResponseDto[];
}

/**
 * PATCH /reservations/:id/cancel
 * Cancela una reservación existente.
 */
export async function cancelReservation(
  token: string,
  reservationId: string,
): Promise<void> {
  const response = await fetch(new URL(`reservations/${encodeURIComponent(reservationId)}/cancel`, getApiBaseUrl()), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ReservationApiError(response.status, await messageFrom(response));
  }
}
