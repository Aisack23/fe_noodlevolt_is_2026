import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type SafeSessionUser = {
  id?: string;
  email?: string;
  nombre?: string;
  rol?: string;
};

// Guarda el token de sesión en una cookie httpOnly (no accesible desde JS del cliente).
export async function createSession(token: string) {
  'use server';
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function deleteSession() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Obtiene de forma segura los datos públicos del usuario en la sesión actual
 * a partir del JWT almacenado en la cookie httpOnly.
 * Si el token no existe o ha expirado, elimina la cookie y retorna null.
 * Nunca expone el token ni secretos al cliente.
 */
export async function getSessionUser(): Promise<SafeSessionUser | null> {
  const token = await getSession();
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      // token malformed; treat as unauthenticated
      return null;
    }

    const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);

    // Verificar si el token ya expiró según su timestamp 'exp' (en segundos)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return {
      id: payload.id ?? payload.sub,
      email: payload.email,
      nombre: payload.nombre ?? payload.name,
      rol: payload.rol ?? payload.role,
    };
  } catch {
    await deleteSession();
    return null;
  }
}

