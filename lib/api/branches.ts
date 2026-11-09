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
    typeof value.address === "string" &&
    typeof value.timeZone === "string" &&
    typeof value.isActive === "boolean" &&
    typeof value.isOpen === "boolean"
  );
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

  return data;
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
