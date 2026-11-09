const STORAGE_KEY = "noodlevolt_order_attempt";

type StoredAttempt = { fingerprint: string; operationKey: string };

function readAttempt(): StoredAttempt | null {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (
      typeof value === "object" &&
      value !== null &&
      "fingerprint" in value &&
      "operationKey" in value &&
      typeof value.fingerprint === "string" &&
      typeof value.operationKey === "string"
    ) {
      return value as StoredAttempt;
    }
  } catch {
    // Un almacenamiento corrupto nunca debe impedir volver a intentar el pedido.
  }
  return null;
}

/** Conserva la clave mientras el carrito y su modalidad no cambien. */
export function getOperationKey(fingerprint: string): string {
  const stored = readAttempt();
  if (stored?.fingerprint === fingerprint) return stored.operationKey;

  const operationKey = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint, operationKey }));
  return operationKey;
}

export function clearOperationKey(): void {
  if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
}
