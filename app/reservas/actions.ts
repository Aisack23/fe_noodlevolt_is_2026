"use server";

import {
  createReservation,
  getAvailableTablesForBooking,
  ReservationApiError,
  type CreateReservationDto,
  type DiningTableResponseDto,
  type ReservationResponseDto,
} from "@/lib/api/reservations";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export type BookReservationResult =
  | { ok: true; reservation: ReservationResponseDto }
  | {
      ok: false;
      kind:
        | "unauthenticated"
        | "forbidden"
        | "validation"
        | "not_found"
        | "conflict"
        | "error";
      message: string;
    };

export type SearchTablesResult =
  | { ok: true; tables: DiningTableResponseDto[] }
  | { ok: false; message: string };

/**
 * Server Action para reservar una mesa en el backend (POST /reservations).
 * Exige sesión con rol CLIENT.
 */
export async function bookReservation(
  input: CreateReservationDto,
): Promise<BookReservationResult> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);

  if (!token || !user) {
    return {
      ok: false,
      kind: "unauthenticated",
      message: "Debes iniciar sesión para realizar una reservación.",
    };
  }

  if (user.rol !== "CLIENT") {
    return {
      ok: false,
      kind: "forbidden",
      message: "Solo los clientes pueden reservar mesas.",
    };
  }

  // Validaciones
  if (!input.branchId) {
    return {
      ok: false,
      kind: "validation",
      message: "Debes seleccionar una sucursal válida.",
    };
  }

  const startsAtDate = new Date(input.startsAt);
  if (!Number.isFinite(startsAtDate.getTime()) || startsAtDate.getTime() <= Date.now()) {
    return {
      ok: false,
      kind: "validation",
      message: "La reservación debe ser para una fecha y hora futura.",
    };
  }

  if (!input.guests || input.guests < 1 || input.guests > 100) {
    return {
      ok: false,
      kind: "validation",
      message: "La cantidad de personas debe ser entre 1 y 100.",
    };
  }

  if (!input.contactName?.trim()) {
    return {
      ok: false,
      kind: "validation",
      message: "Ingresa el nombre de contacto para la reservación.",
    };
  }

  if (!input.phone?.trim()) {
    return {
      ok: false,
      kind: "validation",
      message: "Ingresa un número telefónico de contacto.",
    };
  }

  try {
    const reservation = await createReservation(token, {
      branchId: input.branchId,
      startsAt: input.startsAt,
      guests: Number(input.guests),
      contactName: input.contactName.trim(),
      phone: input.phone.trim(),
    });

    return { ok: true, reservation };
  } catch (error) {
    if (error instanceof ReservationApiError) {
      if (error.status === 401) {
        await deleteSession();
        return {
          ok: false,
          kind: "unauthenticated",
          message: "Tu sesión expiró. Inicia sesión para continuar.",
        };
      }
      if (error.status === 403) {
        return {
          ok: false,
          kind: "forbidden",
          message: "Tu cuenta no tiene permisos para reservar.",
        };
      }
      if (error.status === 404) {
        return {
          ok: false,
          kind: "not_found",
          message: "La sucursal seleccionada no está disponible.",
        };
      }
      if (error.status === 409) {
        return {
          ok: false,
          kind: "conflict",
          message:
            typeof error.serverMessage === "string"
              ? error.serverMessage
              : "No hay mesas disponibles con capacidad suficiente para ese horario.",
        };
      }
      return {
        ok: false,
        kind: "validation",
        message: error.message,
      };
    }

    return {
      ok: false,
      kind: "error",
      message: "No se pudo completar la reservación. Intenta de nuevo.",
    };
  }
}

export async function searchTables(
  branchId: string,
  startsAt: string,
  guests: number,
): Promise<SearchTablesResult> {
  const token = await getSession();

  if (!token) {
    return {
      ok: false,
      message: "Debes iniciar sesión para buscar mesas disponibles.",
    };
  }

  if (!branchId || !startsAt || !guests) {
    return {
      ok: false,
      message: "Faltan parámetros para realizar la búsqueda de mesas.",
    };
  }

  try {
    // Validamos que sea una fecha válida antes de enviarla
    const dateObj = new Date(startsAt);
    if (!Number.isFinite(dateObj.getTime())) {
      return { ok: false, message: "Formato de fecha inválido." };
    }
    const tables = await getAvailableTablesForBooking(token, branchId, startsAt, guests);
    return { ok: true, tables };
  } catch (error) {
    if (error instanceof ReservationApiError) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: "No fue posible consultar las mesas disponibles. Intenta de nuevo.",
    };
  }
}