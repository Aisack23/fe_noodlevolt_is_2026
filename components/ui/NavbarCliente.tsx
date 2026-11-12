"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Receipt, ShoppingCart, Star, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import Campana from "@/components/ui/Campana";
import type { SafeSessionUser } from "@/lib/session";

const enlacesInvitado = [
  { href: "/menu", etiqueta: "Menú" },
  { href: "/reservas", etiqueta: "Reservar" },
];

const enlacesConSesion = [
  { href: "/menu", etiqueta: "Menú" },
  { href: "/reservas", etiqueta: "Reservar" },
  { href: "/pedidos", etiqueta: "Mis pedidos" },
];

type NavbarClienteProps = {
  estaAutenticado?: boolean;
  usuario?: SafeSessionUser | null;
};

export function NavbarCliente({
  estaAutenticado: propEstaAutenticado,
  usuario: propUsuario,
}: NavbarClienteProps = {}) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const {
    user: contextUser,
    isAuthenticated: contextIsAuthenticated,
    logout,
  } = useAuth();

  // El estado puede provenir del prop (SSR directo desde layout) o del contexto reactivo
  const autenticado =
    propEstaAutenticado !== undefined
      ? propEstaAutenticado
      : contextIsAuthenticated;
  const usuarioActual = propUsuario !== undefined ? propUsuario : contextUser;

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  // Si la ruta cambia, cerramos el menú durante el renderizado (sin useEffect)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuAbierto(false);
  }

  const enlaces = autenticado ? enlacesConSesion : enlacesInvitado;

  // Cerrar menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuAbierto(false);
      }
    }

    if (menuAbierto) {
      document.addEventListener("mousedown", handleClickAfuera);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAfuera);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuAbierto]);

  const inicialUsuario =
    usuarioActual?.nombre?.trim()?.charAt(0).toUpperCase() ||
    usuarioActual?.email?.trim()?.charAt(0).toUpperCase() ||
    null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-10">
        <Link
          href="/menu"
          aria-label="NoodleVolt, ir al menú"
          className="relative block h-12 w-28 shrink-0 overflow-hidden rounded-control outline-none focus-visible:shadow-focus md:h-16 md:w-[147px]"
        >
          <Image
            src="/brand/Logo/Horizontal.jpeg"
            alt=""
            fill
            sizes="147px"
            priority
            className="object-cover"
          />
        </Link>

        {/* Navegación central en desktop */}
        <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
          {enlaces.map(({ href, etiqueta }) => {
            const activo = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 px-3 py-2 text-base font-semibold outline-none focus-visible:shadow-focus",
                  activo
                    ? "border-crimson text-crimson"
                    : "border-transparent text-brown hover:text-crimson",
                )}
              >
                {etiqueta}
              </Link>
            );
          })}
        </nav>

        {/* Acciones de la derecha */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Componente Campana (Solo visible si está autenticado o disponible según rol) */}
          {autenticado && <Campana />}

          {/* Botón del Carrito (siempre visible con insignia de cantidad) */}
          <Link
            href="/pedidos/llevar"
            aria-label={
              totalItems > 0
                ? `Carrito con ${totalItems} ${totalItems === 1 ? "platillo" : "platillos"}`
                : "Carrito"
            }
            className="relative inline-flex size-11 items-center justify-center rounded-control text-brown outline-none hover:bg-cream focus-visible:shadow-focus"
          >
            <ShoppingCart aria-hidden className="size-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-crimson text-xs font-bold text-white shadow-sm">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Estado de autenticación */}
          {autenticado ? (
            /* Usuario autenticado: Menú de usuario con Avatar */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuAbierto((prev) => !prev)}
                aria-expanded={menuAbierto}
                aria-haspopup="true"
                aria-label="Menú de perfil"
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border-2 border-brown bg-cream text-brown font-display text-base font-bold outline-none transition-colors",
                  "hover:border-crimson hover:text-crimson focus-visible:shadow-focus",
                  menuAbierto && "border-crimson ring-2 ring-crimson/20",
                )}
              >
                {inicialUsuario ? (
                  <span>{inicialUsuario}</span>
                ) : (
                  <User aria-hidden className="size-5" />
                )}
              </button>

              {menuAbierto && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-60 rounded-card border-2 border-brown bg-white p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-2 border-b border-border/80">
                    <p className="font-semibold text-sm text-brown truncate">
                      {usuarioActual?.nombre || "Cliente"}
                    </p>
                    {usuarioActual?.email && (
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {usuarioActual.email}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/pedidos"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-brown hover:bg-cream rounded-control font-medium transition-colors"
                    >
                      <Receipt aria-hidden className="size-4 text-text-secondary" />
                      Mis pedidos
                    </Link>
                    <Link
                      href="/perfil/puntos"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-brown hover:bg-cream rounded-control font-medium transition-colors"
                    >
                      <Star aria-hidden className="size-4 text-orange" />
                      Mis puntos
                    </Link>
                  </div>

                  <div className="border-t border-border/80 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuAbierto(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-control font-medium w-full text-left transition-colors"
                    >
                      <LogOut aria-hidden className="size-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Usuario invitado: Botón «Iniciar sesión» */
            <>
              {/* Desktop */}
              <Link
                href="/login"
                className="hidden min-h-11 items-center rounded-control bg-crimson px-6 py-3 text-base font-semibold text-white outline-none hover:bg-crimson-hover focus-visible:shadow-focus md:inline-flex"
              >
                Iniciar sesión
              </Link>

              {/* Móvil */}
              <Link
                href="/login"
                aria-label="Iniciar sesión"
                className="inline-flex size-11 items-center justify-center rounded-control text-brown outline-none hover:bg-cream focus-visible:shadow-focus md:hidden"
              >
                <User aria-hidden className="size-6" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}