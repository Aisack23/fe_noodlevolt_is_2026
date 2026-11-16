"use server";

import { redirect } from "next/navigation";
import type { Mesa, SalonDish } from "@/lib/api/salon";
import { getSalonMenu } from "@/lib/api/salon-menu";
import { TablesApiError, getBranchTables } from "@/lib/api/tables";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

type Failure = { ok: false; message: string };
type MesasResult = { ok: true; mesas: Mesa[] } | Failure;
type MenuResult = { ok: true; dishes: SalonDish[] } | Failure;

const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";
const NO_PERMISSION = "Tu cuenta no tiene permiso para realizar esta acción.";

async function requireWaiter(): Promise<{ token: string; branchId: string } | Failure> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) {
    await deleteSession();
    redirect("/login");
  }
  if (user.rol !== "WAITER") return { ok: false, message: NO_PERMISSION };
  if (!user.branchId) return { ok: false, message: "Tu cuenta no tiene una sucursal asignada." };
  return { token, branchId: user.branchId };
}

export async function refreshMesas(): Promise<MesasResult> {
  const sesion = await requireWaiter();
  if ("ok" in sesion) return sesion;

  try {
    return { ok: true, mesas: await getBranchTables(sesion.token, sesion.branchId) };
  } catch (error) {
    if (error instanceof TablesApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof TablesApiError && error.status === 403) {
      return { ok: false, message: NO_PERMISSION };
    }
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function refreshMenu(): Promise<MenuResult> {
  const sesion = await requireWaiter();
  if ("ok" in sesion) return sesion;

  try {
    const menu = await getSalonMenu(sesion.branchId);
    return { ok: true, dishes: menu.dishes };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}