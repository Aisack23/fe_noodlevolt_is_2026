"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  deleteSession,
  getSessionUser,
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
    nombre?: string;
    email?: string;
    telefono?: string;
    password?: string;
  };
  values?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ValidRole =
  | "CLIENT"
  | "MESERO"
  | "COCINA"
  | "GERENTE"
  | "GERENTE_GENERAL";

const ROLE_ROUTES: Record<ValidRole, string> = {
  CLIENT: "/menu",
  MESERO: "/mesero/salon",
  COCINA: "/cocina/tablero",
  GERENTE: "/gerente",
  GERENTE_GENERAL: "/reportes/ventas",
};

/**
 * Decodifica de forma segura la carga útil del JWT únicamente para seleccionar
 * la ruta inicial de la UI según el rol. No sustituye la validación de autenticidad
 * ni el control de acceso en el backend o middleware.
 */
function getRouteForToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);
    const role = payload?.rol ?? payload?.role;
    if (typeof role === "string" && role in ROLE_ROUTES) {
      return ROLE_ROUTES[role as ValidRole];
    }
    return null;
  } catch {
    return null;
  }
}

// Llama a la API de autenticación. Devuelve el token si las credenciales son
// válidas, o null si la API responde 401/403.
async function authenticate(email: string, password: string): Promise<string | null> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const res = await fetch(new URL("auth/login", apiUrl.replace(/\/?$/, "/")), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`auth/login respondió ${res.status}`);
  }

  const data = await res.json();
  const token: string | undefined =
    data.token ?? data.accessToken ?? data.access_token;
  if (!token) {
    throw new Error("La respuesta de auth/login no incluye un token.");
  }
  return token;
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

  let token: string | null;
  try {
    token = await authenticate(email, password);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { error: "No se pudo iniciar sesión. Intenta más tarde.", email };
  }
  if (!token) {
    return { error: "Correo o contraseña incorrectos.", email };
  }

  const destination = getRouteForToken(token);
  if (!destination) {
    return {
      error: "Tu cuenta no tiene un rol válido reconocido para acceder.",
      email,
    };
  }

  await createSession(token);
  redirect(destination);
}

export async function registro(
  _prevState: RegistroState,
  formData: FormData,
): Promise<RegistroState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: NonNullable<RegistroState["fieldErrors"]> = {};

  if (!nombre || nombre.length > 100) {
    fieldErrors.nombre = "Escribe tu nombre (máximo 100 caracteres).";
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Ingresa un correo válido.";
  }

  if (telefono && !/^\d{8}$/.test(telefono)) {
    fieldErrors.telefono = "El teléfono debe tener 8 dígitos.";
  }

  if (!password || password.length < 8) {
    fieldErrors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      values: { nombre, email, telefono },
    };
  }

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const payload: Record<string, string> = {
    nombre,
    email,
    password,
  };
  // Omitir telefono si no fue provisto
  if (telefono) {
    payload.telefono = telefono;
  }
  // No se envía atributo rol

  let registradoExitoso = false;

  try {
    const res = await fetch(new URL("users", apiUrl.replace(/\/?$/, "/")), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.status === 409) {
      return {
        error: "Ya existe una cuenta con este correo.",
        values: { nombre, email, telefono },
      };
    }

    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      const mensaje = Array.isArray(data?.message)
        ? data.message.join(". ")
        : data?.message || "Los datos proporcionados son inválidos.";
      return {
        error: mensaje,
        values: { nombre, email, telefono },
      };
    }

    if (!res.ok) {
      return {
        error: "No se pudo registrar la cuenta. Intenta más tarde.",
        values: { nombre, email, telefono },
      };
    }

    registradoExitoso = true;
  } catch (error) {
    console.error("Error al registrar cuenta:", error);
    return {
      error: "No se pudo conectar con el servicio. Intenta más tarde.",
      values: { nombre, email, telefono },
    };
  }

  if (registradoExitoso) {
    redirect("/login?registrado=true");
  }

  return {};
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
