import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Rutas de autenticación exclusivas para usuarios sin sesión activa
const authRoutes = ["/login", "/registro"];

// Rutas públicas accesibles tanto por invitados como por clientes autenticados
const publicRoutes = ["/menu", "/pedidos/llevar", "/reservas"];

/**
 * Verifica si el token JWT no ha expirado según su payload `exp`.
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute =
    publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = Boolean(sessionToken && isTokenValid(sessionToken));

  // Si se visita la raíz "/", redirigir siempre a la carta del menú
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/menu", request.nextUrl));
  }

  // Si no tiene sesión activa y la ruta requiere autenticación, redirigir a /login
  if (!isAuthRoute && !isPublicRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Si ya tiene sesión activa e intenta acceder a /login o /registro, redirigir al menú
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/menu", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

