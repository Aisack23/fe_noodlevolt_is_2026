/** Contrato FE-07 (HU-07): saldo de puntos de lealtad del cliente autenticado. */

export type LoyaltyBalance = {
  /** Entero no negativo. El backend devuelve 0 si el cliente aún no tiene cuenta. */
  points: number;
};

export type LoyaltyApiErrorKind = "unauthorized" | "forbidden" | "http";

/** Conserva el status HTTP para que la UI distinga 401, 403 y el resto. */
export class LoyaltyApiError extends Error {
  readonly status: number;
  readonly kind: LoyaltyApiErrorKind;

  constructor(status: number) {
    super(`La API de puntos respondió ${status}.`);
    this.name = "LoyaltyApiError";
    this.status = status;
    this.kind = status === 401 ? "unauthorized" : status === 403 ? "forbidden" : "http";
  }
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }
  return apiUrl.replace(/\/?$/, "/");
}

export function isLoyaltyBalance(value: unknown): value is LoyaltyBalance {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).points === "number" &&
    Number.isInteger((value as Record<string, unknown>).points) &&
    ((value as Record<string, unknown>).points as number) >= 0
  );
}

/**
 * GET /loyalty/me — solo CLIENTE. La identidad sale del token; no se envía userId.
 * Siempre sin caché: el saldo cambia cuando se aprueba un pago.
 */
export async function getMyLoyalty(token: string): Promise<LoyaltyBalance> {
  const response = await fetch(new URL("loyalty/me", getApiBaseUrl()), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new LoyaltyApiError(response.status);
  }

  const data: unknown = await response.json();
  if (!isLoyaltyBalance(data)) {
    throw new Error("La respuesta de puntos no tiene el formato esperado.");
  }
  // Solo se usa `points`, aunque el servidor agregue otros campos.
  return { points: data.points };
}

const pointsFormatter = new Intl.NumberFormat("en-US");

/** 1250 → "1,250 pts" (formato del diseño acordado). */
export function formatPoints(points: number): string {
  return `${pointsFormatter.format(points)} pts`;
}
