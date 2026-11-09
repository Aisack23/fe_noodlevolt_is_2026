"use server";

import { createOrder, mapOrderResponseToPedido, OrderApiError } from "@/lib/api/orders";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";
import type { Pedido } from "@/lib/orders/types";

export type SubmitTakeoutOrderInput = {
  branchId: string;
  branchName: string;
  operationKey: string;
  paymentMode: "ONLINE" | "AT_COUNTER";
  lines: Array<{ dishId: string; quantity: number; expectedPrice?: string }>;
};

export type SubmitTakeoutOrderResult =
  | { ok: true; pedido: Pedido }
  | { ok: false; kind: "unauthenticated" | "forbidden" | "validation" | "not_found" | "conflict" | "error"; message: string };

const statusMessages: Record<number, { kind: Exclude<SubmitTakeoutOrderResult, { ok: true }> ["kind"]; message: string }> = {
  400: { kind: "validation", message: "Los datos del pedido no son válidos. Revisa tu carrito e intenta de nuevo." },
  403: { kind: "forbidden", message: "Tu cuenta no tiene permisos para realizar pedidos." },
  404: { kind: "not_found", message: "No se encontró la sucursal seleccionada." },
  409: { kind: "conflict", message: "No fue posible confirmar el pedido. Revisa la disponibilidad y los precios antes de reintentar." },
};

function messageForConflict(error: OrderApiError): string {
  return typeof error.serverMessage === "string"
    ? error.serverMessage
    : Array.isArray(error.serverMessage)
      ? error.serverMessage.join(". ")
      : statusMessages[409].message;
}

function validInput(input: SubmitTakeoutOrderInput): boolean {
  return Boolean(input.branchId) &&
    Boolean(input.operationKey) &&
    input.lines.length > 0 &&
    input.lines.length <= 100 &&
    input.lines.every((line) => Boolean(line.dishId) && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 20);
}

export async function submitTakeoutOrder(
  input: SubmitTakeoutOrderInput,
): Promise<SubmitTakeoutOrderResult> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) return { ok: false, kind: "unauthenticated", message: "Tu sesión expiró. Inicia sesión para continuar." };
  if (user.rol !== "CLIENT") return { ok: false, kind: "forbidden", message: "Tu cuenta no tiene permisos para realizar pedidos." };
  if (!validInput(input)) {
    return { ok: false, kind: "validation", message: "Los datos del pedido no son válidos. Revisa tu carrito e intenta de nuevo." };
  }

  try {
    const order = await createOrder(token, {
      branchId: input.branchId,
      operationKey: input.operationKey,
      paymentMode: input.paymentMode,
      lines: input.lines,
    });
    return { ok: true, pedido: mapOrderResponseToPedido(order, input.branchName) };
  } catch (error) {
    if (error instanceof OrderApiError) {
      if (error.status === 401) {
        await deleteSession();
        return { ok: false, kind: "unauthenticated", message: "Tu sesión expiró. Inicia sesión para continuar." };
      }
      if (error.status === 409) {
        return { ok: false, kind: "conflict", message: messageForConflict(error) };
      }
      const known = statusMessages[error.status];
      if (known) return { ok: false, ...known };
    }
    return { ok: false, kind: "error", message: "No se pudo completar la operación. Intenta de nuevo." };
  }
}
