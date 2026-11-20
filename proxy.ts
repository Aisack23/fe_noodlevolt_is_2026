import { NextResponse, type NextRequest } from "next/server";
import { safeReturnTo, SESSION_COOKIE, verifySession } from "@/lib/auth/api-session";
import { homeForRole } from "@/lib/auth/roles";

const publicRoutes = ["/menu", "/pedidos/llevar"];
const authRoutes = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL("/menu", request.url));
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  const user = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
    .catch(() => undefined);
  if (user === undefined) {
    return new NextResponse("No se pudo verificar tu sesión. Recarga la página para reintentar.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  if (authRoutes.includes(pathname)) {
    if (!user) return NextResponse.next();
    const destination = safeReturnTo(request.nextUrl.searchParams.get("returnTo")) ?? homeForRole(user.role) ?? "/menu";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("returnTo", pathname + search);
    return NextResponse.redirect(login, 303);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
