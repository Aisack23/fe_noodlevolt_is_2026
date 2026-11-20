import { cache } from "react";
import { cookies } from "next/headers";
import {
  REFRESH_COOKIE, SESSION_COOKIE, verifiedExpiration, verifySession, type SessionTokens,
} from "@/lib/auth/api-session";

export type SafeSessionUser = {
  id?: string;
  email?: string;
  nombre?: string;
  rol?: string;
  branchId?: string;
  expiresAt?: number;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSession(tokens: SessionTokens) {
  const store = await cookies();
  store.set(SESSION_COOKIE, tokens.accessToken, {
    ...cookieOptions,
    expires: new Date(verifiedExpiration(tokens.accessToken)),
  });
  const refreshExpiration = tokens.refreshExpiresAt ? new Date(tokens.refreshExpiresAt) : undefined;
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...cookieOptions,
    sameSite: "strict",
    expires: refreshExpiration,
  });
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

const getVerifiedSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await verifySession(token);
  if (!user) return null;
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nombre: user.name ?? undefined,
      rol: user.role ?? undefined,
      branchId: user.branchId ?? undefined,
      expiresAt: verifiedExpiration(token),
    } satisfies SafeSessionUser,
  };
});

export async function getSession() {
  return (await getVerifiedSession())?.token;
}

export async function getSessionUser(): Promise<SafeSessionUser | null> {
  return (await getVerifiedSession())?.user ?? null;
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
}
