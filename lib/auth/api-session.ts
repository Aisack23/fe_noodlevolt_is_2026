import { getApiBaseUrl } from "../api/base-url.ts";

export const SESSION_COOKIE = "session";
export const REFRESH_COOKIE = "session_refresh";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  branchId: string | null;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt?: string;
};

export function authRequest(path: string, init?: RequestInit) {
  return fetch(new URL(`auth/${path}`, getApiBaseUrl()), {
    ...init,
    cache: "no-store",
  });
}

export function authPost(path: string, input: object) {
  return authRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function authenticateSession(email: string, password: string) {
  const response = await authPost("login", { email, password });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`auth/login respondió ${response.status}`);
  const tokens: SessionTokens = await response.json();
  const user = await verifySession(tokens.accessToken);
  if (!user) throw new Error("La API no pudo verificar la sesión recién emitida.");
  return { tokens, user };
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  const response = await authRequest("me", { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("No se pudo verificar la sesión.");
  const user: Omit<SessionUser, "role" | "name" | "branchId"> &
    Partial<Pick<SessionUser, "role" | "name" | "branchId">> = await response.json();

  // El contrato anterior omitía estos campos en /auth/me. El backend ya
  // verificó el token y podemos usar sus claims para la navegación de esa sesión.
  if (user.role === undefined) {
    const claims = readTokenClaims(token);
    if (claims.sub !== user.id) return null;
    return {
      ...user,
      role: typeof claims.role === "string" ? claims.role : null,
      branchId: typeof claims.branchId === "string" ? claims.branchId : null,
      name: user.name ?? null,
    };
  }
  return { ...user, branchId: user.branchId ?? null, name: user.name ?? null, role: user.role };
}

function readTokenClaims(token: string) {
  const claims: { sub?: unknown; role?: unknown; branchId?: unknown; exp?: unknown } =
    JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  return claims;
}

/** Solo para calcular el tiempo restante de un token emitido o verificado por la API. */
export function verifiedExpiration(token: string): number {
  const { exp } = readTokenClaims(token);
  if (typeof exp !== "number" || !Number.isSafeInteger(exp))
    throw new Error("La API emitió un token sin expiración válida.");
  return exp * 1000;
}

export function safeReturnTo(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("\\") ||
      Array.from(value).some((character) => character.charCodeAt(0) <= 32))
    return null;
  const base = new URL("https://noodlevolt.invalid");
  const dest = new URL(value, base);
  if (dest.origin !== base.origin || dest.pathname.startsWith("//") || ["/login", "/registro"].includes(dest.pathname))
    return null;
  return dest.pathname + dest.search + dest.hash;
}
