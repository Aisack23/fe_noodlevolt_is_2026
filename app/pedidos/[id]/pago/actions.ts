"use server";

import {
  simulatePayment,
  PaymentApiError,
  type CardToken,
  type PaymentResult,
} from "@/lib/api/payments";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export type SimulatePaymentActionResult =
  | { ok: true; payment: PaymentResult }
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

const statusMessages: Record<
  number,
  {
    kind: Exclude<SimulatePaymentActionResult, { ok: true }>["kind"];
    message: string;
  }
> = {
  400: {
    kind: "validation",
    message:
      "Los datos del pago no son válidos. Verifica el pedido e intenta de nuevo.",
  },
  403: {
    kind: "forbidden",
    message: "Tu cuenta no tiene permisos para realizar pagos.",
  },
  404: {
    kind: "not_found",
    message: "No se encontró el pedido indicado.",
  },
  409: {
    kind: "conflict",
    message:
      "No fue posible procesar el pago. El pedido puede haber sido pagado o cancelado.",
  },
};


const VALID_TOKENS = new Set<CardToken>(["test_4242", "test_0002"]);

function isValidCardToken(value: unknown): value is CardToken {
  return typeof value === "string" && VALID_TOKENS.has(value as CardToken);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}


export async function submitPaymentSimulation(
  orderId: string,
  cardToken: string,
): Promise<SimulatePaymentActionResult> {
  // 1. Autenticación y autorización
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) {
    return {
      ok: false,
      kind: "unauthenticated",
      message: "Tu sesión expiró. Inicia sesión para continuar.",
    };
  }
  if (user.rol !== "CLIENT") {
    return {
      ok: false,
      kind: "forbidden",
      message: "Tu cuenta no tiene permisos para realizar pagos.",
    };
  }

  // 2. Validación de entrada
  if (!isValidUuid(orderId)) {
    return {
      ok: false,
      kind: "validation",
      message: "El identificador del pedido no es válido.",
    };
  }
  if (!isValidCardToken(cardToken)) {
    return {
      ok: false,
      kind: "validation",
      message: "El token de tarjeta no es válido.",
    };
  }

  // 3. Llamada al backend
  try {
    const payment = await simulatePayment(token, { orderId, cardToken });
    return { ok: true, payment };
  } catch (error) {
    if (error instanceof PaymentApiError) {
      if (error.status === 401) {
        await deleteSession();
        return {
          ok: false,
          kind: "unauthenticated",
          message: "Tu sesión expiró. Inicia sesión para continuar.",
        };
      }
      if (error.status === 409) {
        const msg =
          typeof error.serverMessage === "string"
            ? error.serverMessage
            : Array.isArray(error.serverMessage)
              ? error.serverMessage.join(". ")
              : statusMessages[409].message;
        return { ok: false, kind: "conflict", message: msg };
      }
      const known = statusMessages[error.status];
      if (known) return { ok: false, ...known };
    }
    return {
      ok: false,
      kind: "error",
      message: "No se pudo procesar el pago. Intenta de nuevo.",
    };
  }
}
