"use server";

import { redirect } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { authPost, safeReturnTo, verifiedExpiration, type SessionTokens } from "@/lib/auth/api-session";
import {
  createSession,
  deleteSession,
  getSessionUser,
  getRefreshToken,
  type SafeSessionUser,
} from "@/lib/session";

/**
 * Server Action para consultar el estado actual del usuario autenticado
 * desde componentes del cliente. Retorna SafeSessionUser o null si no hay sesión
 * o si la sesión ha expirado.
 */
export async function checkAuth(): Promise<SafeSessionUser | null> {
  return await getSessionUser();
}


export type LoginState = {
  error?: string;
  email?: string;
};

export type RegistroState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    lastName?: string;
    password?: string;
  };
  values?: {
    name?: string;
    email?: string;
    lastName?: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ValidRole =
  | "CLIENT"
  | "WAITER"
  | "COOK"
  | "BRANCH_ADMIN"
  | "GENERAL_MANAGER";


const ROLE_ROUTES: Record<ValidRole, string> = {
  CLIENT: "/menu",
  WAITER: "/mesero/listos",
  COOK: "/cocina/tablero",
  BRANCH_ADMIN: "/gerente/inventario",
  GENERAL_MANAGER: "/gerente/reportes",
};

async function authenticate(email: string, password: string): Promise<SessionTokens | null> {
  const response = await authPost("login", { email, password });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`auth/login respondió ${response.status}`);
  return response.json();
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email && !password) {
    return { error: "Ingresa tu correo y contraseña.", email };
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: "Ingresa un correo válido.", email };
  }
  if (!password) {
    return { error: "Ingresa tu contraseña.", email };
  }

  let session: SessionTokens | null;
  try {
    session = await authenticate(email, password);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { error: "No se pudo iniciar sesión. Intenta más tarde.", email };
  }
  if (!session) {
    return { error: "Correo o contraseña incorrectos.", email };
  }

  const destination = safeReturnTo(formData.get("returnTo")) ??
    (Object.hasOwn(ROLE_ROUTES, session.user.role) ? ROLE_ROUTES[session.user.role as ValidRole] : null);
  if (!destination) {
    return {
      error: "Tu cuenta no tiene un rol válido reconocido para acceder.",
      email,
    };
  }

  await createSession(session);
  redirect(destination);
}

export async function registro(
  _prevState: RegistroState,
  formData: FormData,
): Promise<RegistroState> {
  const name = String(formData.get("name") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { name, lastName, email };
  const fieldErrors: NonNullable<RegistroState["fieldErrors"]> = {};

  if (name.length < 2 || name.length > 100)
    fieldErrors.name = "Escribe tu nombre (entre 2 y 100 caracteres).";
  if (lastName.length < 2 || lastName.length > 100)
    fieldErrors.lastName = "Escribe tu apellido (entre 2 y 100 caracteres).";
  if (!EMAIL_REGEX.test(email) || email.length > 254)
    fieldErrors.email = "Ingresa un correo válido.";
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password))
    fieldErrors.password = "Usa al menos 8 caracteres con una mayúscula, una minúscula y un número. Máximo 72 bytes.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  let registradoExitoso = false;

  try {
    const res = await fetch(new URL("users", getApiBaseUrl()), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, password }),
      cache: "no-store",
    });

    if (res.status === 409) {
      return {
        error: "Ya existe una cuenta con este correo.",
        values,
      };
    }

    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      const mensaje = Array.isArray(data?.message)
        ? data.message.join(". ")
        : data?.message || "Los datos proporcionados son inválidos.";
      return {
        error: mensaje,
        values,
      };
    }

    if (!res.ok) {
      return {
        error: "No se pudo registrar la cuenta. Intenta más tarde.",
        values,
      };
    }

    registradoExitoso = true;
  } catch (error) {
    console.error("Error al registrar cuenta:", error);
    return {
      error: "No se pudo conectar con el servicio. Intenta más tarde.",
      values,
    };
  }

  if (registradoExitoso) {
    redirect("/login?registrado=true");
  }

  return {};
}

export async function renewSession(): Promise<number | null> {
  const user = await getSessionUser();
  if (!user?.expiresAt) return null;
  if (user.expiresAt - Date.now() > 60_000) return user.expiresAt;
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  const response = await authPost("refresh", { refreshToken });
  if (response.status === 401) {
    await deleteSession();
    return null;
  }
  if (!response.ok) throw new Error("No se pudo renovar la sesión.");
  const session: SessionTokens = await response.json();
  await createSession(session);
  return verifiedExpiration(session.accessToken);
}

export async function logout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    const response = await authPost("logout", { refreshToken });
    if (!response.ok) throw new Error("No se pudo cerrar la sesión. Intenta nuevamente.");
  }
  await deleteSession();
  redirect("/login");
}
