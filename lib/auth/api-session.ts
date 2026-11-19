import { getApiBaseUrl } from "../api/base-url.ts";

export const SESSION_COOKIE = "session";
export const REFRESH_COOKIE = "session_refresh";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  branchId: string | null;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresAt: string;
  user: SessionUser;
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

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  const response = await authRequest("me", { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("No se pudo verificar la sesión.");
  return response.json();
}

/** Solo para calcular el tiempo restante de un token que la API ya verificó. */
export function verifiedExpiration(token: string): number {
  const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  return claims.exp * 1000;
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
