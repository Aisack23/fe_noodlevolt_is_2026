"use server";

import { getSession, getSessionUser } from "@/lib/session";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import {
  cancelReservation, getBranchReservations, getReservationTableCount,
  ReservationApiError, type ReservationItem,
} from "@/lib/api/reservations";

type Failure = { ok: false; message: string };
type ListResult = { ok: true; reservations: ReservationItem[]; totalMesas: number } | Failure;
type CancellationResult = { ok: true; id: string; status: "CANCELED" } | Failure;

function failure(error: unknown): Failure {
  return {
    ok: false,
    message: error instanceof ReservationApiError && error.status < 500
      ? error.message
      : "No se pudo completar la operación de reservaciones. Intenta de nuevo.",
  };
}

export async function getBranchReservationsAction(branchId: string, date: string): Promise<ListResult> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token) return { ok: false, message: "Tu sesión expiró. Inicia sesión para continuar." };
  if (!canAccessBranchAdministration(user?.rol) || (user?.rol === "BRANCH_ADMIN" && user.branchId !== branchId))
    return { ok: false, message: "No tienes permiso para consultar esta sucursal." };
  try {
    const [reservations, totalMesas] = await Promise.all([
      getBranchReservations(token, branchId, date),
      getReservationTableCount(token, branchId),
    ]);
    return { ok: true, reservations, totalMesas };
  } catch (error) {
    return failure(error);
  }
}

export async function cancelReservationAction(id: string): Promise<CancellationResult> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token) return { ok: false, message: "Tu sesión expiró. Inicia sesión para continuar." };
  if (!canAccessBranchAdministration(user?.rol))
    return { ok: false, message: "No tienes permiso para cancelar reservaciones." };
  try {
    const reservation = await cancelReservation(token, id);
    return { ok: true, ...reservation };
  } catch (error) {
    return failure(error);
  }
}
