"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Utensils,
  Flame,
  ListChecks,
  Calendar,
  ClipboardList,
  AlertTriangle,
  ShoppingCart,
  Building2,
  TrendingUp,
  LogOut,
  Star,
  type LucideIcon
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

type NavItem = { href: string; etiqueta: string; Icon: LucideIcon };

// Sincronizado con los roles reales del backend
export type RolPersonal = "BRANCH_ADMIN" | "GENERAL_MANAGER" | "WAITER";

const itemsPorRol: Record<RolPersonal, NavItem[]> = {
  WAITER: [
    { href: "/mesero/comanda", etiqueta: "Nueva comanda", Icon: Utensils },
    { href: "/mesero/listos", etiqueta: "Listos para entregar", Icon: ListChecks },
  ],
  BRANCH_ADMIN: [
    { href: "/gerente/cocina", etiqueta: "Tablero de cocina", Icon: Flame },
    { href: "/gerente/reservaciones", etiqueta: "Reservaciones", Icon: Calendar },
    { href: "/gerente/inventario", etiqueta: "Inventario", Icon: ClipboardList },
    { href: "/gerente/insumos-por-comprar", etiqueta: "Insumos por comprar", Icon: AlertTriangle },
    { href: "/gerente/compras", etiqueta: "Compras", Icon: ShoppingCart },
    { href: "/gerente/reportes/ventas", etiqueta: "Ventas", Icon: TrendingUp },
    { href: "/gerente/reportes/top-dishes", etiqueta: "Platillos más vendidos", Icon: Utensils },
    { href: "/gerente/resenas", etiqueta: "Reseñas", Icon: Star },
    { href: "/admin/sucursales", etiqueta: "Sucursales", Icon: Building2 },
  ],
  GENERAL_MANAGER: [
    { href: "/admin/sucursales", etiqueta: "Sucursales", Icon: Building2 },
    { href: "/gerente/reservaciones", etiqueta: "Reservaciones", Icon: Calendar },
    { href: "/gerente/inventario", etiqueta: "Inventario", Icon: ClipboardList },
    { href: "/gerente/reportes/ventas", etiqueta: "Ventas", Icon: TrendingUp },
    { href: "/gerente/reportes/top-dishes", etiqueta: "Platillos más vendidos", Icon: Utensils },
    { href: "/gerente/resenas", etiqueta: "Reseñas", Icon: Star },
  ],
};

export function PersonalMobileNav({ rol }: { rol: RolPersonal }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="flex flex-wrap gap-2 border-b border-border px-4 py-3 md:hidden"
    >
      {itemsPorRol[rol].map(({ href, etiqueta }) => {
        const activo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-control px-3 py-2 text-sm font-semibold outline-none focus-visible:shadow-focus",
              activo ? "bg-crimson text-white" : "text-crimson hover:bg-cream",
            )}
          >
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

export function PersonalSidebar({ rol }: { rol: RolPersonal }) {
  const pathname = usePathname();
  const items = itemsPorRol[rol];

  return (
    <aside className="hidden w-56 shrink-0 flex-col bg-brown px-4 py-6 text-white md:flex overflow-y-auto shadow-md">
      {/* Encabezado / Logo */}
      <div className="flex items-center gap-3 pb-8">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-control bg-white">
          <Image
            src="/brand/Logo/Mascota.jpeg"
            alt="NoodleVolt"
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
        <p className="font-display text-h3 font-bold uppercase leading-none">
          Noodle<span className="text-gold">Volt</span>
        </p>
      </div>

      {/* Enlaces de navegación */}
      <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
        {items.map(({ href, etiqueta, Icon }) => {
          const activo = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-control px-4 text-base font-semibold text-white outline-none focus-visible:shadow-focus transition-colors",
                activo ? "bg-crimson" : "hover:bg-white/10",
              )}
            >
              <Icon aria-hidden className="size-6 shrink-0" />
              <span className="truncate">{etiqueta}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botón de cerrar sesión */}
      <form action={logout} className="mt-4 border-t border-white/10 pt-4">
        <button
          type="submit"
          className="flex min-h-12 w-full items-center gap-3 rounded-control px-4 text-base font-semibold text-white outline-none hover:bg-white/10 focus-visible:shadow-focus transition-colors"
        >
          <LogOut aria-hidden className="size-6 shrink-0" />
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
