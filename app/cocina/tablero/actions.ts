"use server";

import { redirect } from "next/navigation";
import {
  getKitchenOrders,
  KitchenApiError,
  updateKitchenOrderStatus,
  type KitchenNextStatus,
  type KitchenOrder,
} from "@/lib/api/kitchen";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

type KitchenActionFailure = { ok: false; message: string };
type KitchenListResult = { ok: true; orders: KitchenOrder[] } | KitchenActionFailure;
type KitchenUpdateResult = { ok: true; order: KitchenOrder } | KitchenActionFailure;

const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

async function requireCookSession(): Promise<string | KitchenActionFailure> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) {
    await deleteSession();
    redirect("/login");
  }
  if (user.rol !== "COOK") {
    return { ok: false, message: "Tu cuenta no tiene permiso para realizar esta acción." };
  }
  return token;
}

function errorMessage(error: unknown): string {
  if (error instanceof KitchenApiError && error.status === 409 && error.serverMessage) {
    return error.serverMessage;
  }
  if (error instanceof KitchenApiError && error.status === 403) {
    return "Tu cuenta no tiene permiso para realizar esta acción.";
  }
  return GENERIC_ERROR;
}

export async function refreshKitchenOrders(): Promise<KitchenListResult> {
  const token = await requireCookSession();
  if (typeof token !== "string") return token;
  try {
    return { ok: true, orders: await getKitchenOrders(token) };
  } catch (error) {
    if (error instanceof KitchenApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    return { ok: false, message: errorMessage(error) };
  }
}

export async function advanceKitchenOrder(
  orderId: string,
  status: KitchenNextStatus,
): Promise<KitchenUpdateResult> {
  const token = await requireCookSession();
  if (typeof token !== "string") return token;
  try {
    return { ok: true, order: await updateKitchenOrderStatus(token, orderId, status) };
  } catch (error) {
    if (error instanceof KitchenApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    return { ok: false, message: errorMessage(error) };
  }
}
