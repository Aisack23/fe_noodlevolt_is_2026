import { NextResponse, type NextRequest } from "next/server";
import { safeReturnTo, SESSION_COOKIE, verifySession } from "@/lib/auth/api-session";
import { homeForRole } from "@/lib/auth/roles";

const publicRoutes = ["/menu", "/pedidos/llevar", "/reservas"];
const authRoutes = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL("/menu", request.url));
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  const user = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
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
