"use server";

import { redirect } from "next/navigation";
import {
  deliverKitchenOrder,
  getReadyKitchenOrders,
  KitchenApiError,
  type KitchenOrder,
} from "@/lib/api/kitchen";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

type ActionFailure = { ok: false; message: string };
type ReadyListResult = { ok: true; orders: KitchenOrder[] } | ActionFailure;
type DeliverResult = { ok: true } | ActionFailure;

const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

async function requireWaiterSession(): Promise<string | ActionFailure> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) {
    await deleteSession();
    redirect("/login");
  }
  if (user.rol !== "WAITER") {
    return { ok: false, message: "Tu cuenta no tiene permiso para realizar esta acción." };
  }
  return token;
}

function errorMessage(error: unknown): string {
  if (error instanceof KitchenApiError) {
    if (error.status === 409 && error.serverMessage) return error.serverMessage;
    if (error.status === 403) return "Tu cuenta no tiene permiso para realizar esta acción.";
    if (error.status === 404) return "Este pedido ya no está disponible.";
  }
  return GENERIC_ERROR;
}

export async function refreshReadyOrders(): Promise<ReadyListResult> {
  const token = await requireWaiterSession();
  if (typeof token !== "string") return token;
  try {
    return { ok: true, orders: await getReadyKitchenOrders(token) };
  } catch (error) {
    if (error instanceof KitchenApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    return { ok: false, message: errorMessage(error) };
  }
}

export async function deliverOrder(orderId: string): Promise<DeliverResult> {
  const token = await requireWaiterSession();
  if (typeof token !== "string") return token;
  try {
    await deliverKitchenOrder(token, orderId);
    return { ok: true };
  } catch (error) {
    if (error instanceof KitchenApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    return { ok: false, message: errorMessage(error) };
  }
}