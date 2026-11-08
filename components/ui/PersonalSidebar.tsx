"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LogOut, Settings, type LucideIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

type NavItem = { href: string; etiqueta: string; Icon: LucideIcon };

export type RolPersonal = "GERENTE";

// SUPUESTO

const itemsPorRol: Record<RolPersonal, NavItem[]> = {
  GERENTE: [
    { href: "/gerente/inventario", etiqueta: "Inventario", Icon: ClipboardList },
    { href: "/gerente/configuracion", etiqueta: "Configuración", Icon: Settings },
  ],
};

export function PersonalSidebar({ rol }: { rol: RolPersonal }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-brown px-4 py-6 text-white md:flex">
      <div className="flex items-center gap-3 pb-8">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-control bg-white">
          <Image
            src="/brand/Logo/Mascota.jpeg"
            alt=""
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
        <p className="font-display text-h3 font-bold uppercase leading-none">
          Noodle<span className="text-gold">Volt</span>
        </p>
      </div>

      <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
        {itemsPorRol[rol].map(({ href, etiqueta, Icon }) => {
          const activo = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-control px-4 text-base font-semibold text-white outline-none focus-visible:shadow-focus",
                activo ? "bg-crimson" : "hover:bg-white/10",
              )}
            >
              <Icon aria-hidden className="size-6 shrink-0" />
              {etiqueta}
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="flex min-h-12 w-full items-center gap-3 rounded-control px-4 text-base font-semibold text-white outline-none hover:bg-white/10 focus-visible:shadow-focus"
        >
          <LogOut aria-hidden className="size-6 shrink-0" />
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}