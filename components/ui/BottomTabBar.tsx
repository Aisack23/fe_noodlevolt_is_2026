"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Receipt, Star, User, Utensils, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Pestana = { href: string; etiqueta: string; Icon: LucideIcon };

// Rutas provisionales: /pedidos y /cuenta 
const pestanas: Pestana[] = [
  { href: "/menu", etiqueta: "Menú", Icon: Utensils },
  { href: "/reservas", etiqueta: "Reservar", Icon: Calendar },
  { href: "/pedidos", etiqueta: "Pedidos", Icon: Receipt },
  { href: "/perfil/puntos", etiqueta: "Puntos", Icon: Star },
  { href: "/cuenta", etiqueta: "Cuenta", Icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {pestanas.map(({ href, etiqueta, Icon }) => {
          const activa = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold outline-none focus-visible:shadow-focus",
                  activa ? "text-crimson" : "text-text-secondary",
                )}
              >
                <Icon aria-hidden className="size-6" />
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}