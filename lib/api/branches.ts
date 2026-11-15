export interface Branch {
  id: string;
  name: string;
  address: string;
  timeZone: string;
  isActive: boolean;
  isOpen: boolean;
}

export interface BranchStatusResponse {
  isOpen: boolean;
}

export class BranchApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BranchApiError";
    this.status = status;
  }
}

function getApiUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  return apiUrl.replace(/\/?$/, "/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBranch(value: unknown): value is Branch {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (typeof value.address === "string" || value.address === undefined || value.address === null) &&
    (typeof value.timeZone === "string" || value.timeZone === undefined || value.timeZone === null) &&
    (typeof value.isActive === "boolean" || value.isActive === undefined) &&
    (typeof value.isOpen === "boolean" || value.isOpen === undefined)
  );
}

function normalizeBranch(value: Branch): Branch {
  return {
    id: value.id,
    name: value.name,
    address: typeof value.address === "string" ? value.address : "",
    timeZone: typeof value.timeZone === "string" ? value.timeZone : "America/El_Salvador",
    isActive: typeof value.isActive === "boolean" ? value.isActive : true,
    isOpen: typeof value.isOpen === "boolean" ? value.isOpen : true,
  };
}

function isBranchStatus(value: unknown): value is BranchStatusResponse {
  return isRecord(value) && typeof value.isOpen === "boolean";
}

function authorizationHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET /branches es público; token opcional para conservar consumidores administrativos. */
export async function getBranches(token?: string): Promise<Branch[]> {
  const response = await fetch(new URL("branches", getApiUrl()), {
    ...(token ? { headers: authorizationHeaders(token) } : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BranchApiError("No se pudieron cargar las sucursales.", response.status);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isBranch)) {
    throw new Error("La respuesta de sucursales no tiene el formato esperado.");
  }

  return data.map(normalizeBranch);
}

/**
 * GET /branches/me/branch
 * Obtiene la sucursal asociada al usuario autenticado actual mediante findMyBranch().
 * Si el usuario no tiene una sucursal asignada, el backend devuelve 404 y esta función retorna null.
 * Lanza BranchApiError ante otros errores HTTP.
 */
export async function getMyBranch(token: string): Promise<Branch | null> {
  const response = await fetch(new URL("branches/me/branch", getApiUrl()), {
    headers: authorizationHeaders(token),
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new BranchApiError(
      "No se pudo obtener la sucursal asignada al usuario.",
      response.status,
    );
  }

  const data: unknown = await response.json();
  if (!isBranch(data)) {
    throw new Error("La respuesta de la sucursal asignada no tiene el formato esperado.");
  }

  return normalizeBranch(data);
}

export async function updateBranchStatus(
  token: string,
  branchId: string,
  isOpen: boolean,
): Promise<BranchStatusResponse> {
  const response = await fetch(new URL(`branches/${branchId}/config`, getApiUrl()), {
    method: "PATCH",
    headers: {
      ...authorizationHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isOpen }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BranchApiError("No se pudo actualizar la sucursal.", response.status);
  }

  const data: unknown = await response.json();
  if (!isBranchStatus(data)) {
    throw new Error("La respuesta de la actualización no tiene el formato esperado.");
  }

  return data;
}
