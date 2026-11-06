"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/cn";

// Rutas provisionales: /pedidos y /checkout aún no existen creo 
const enlaces = [
  { href: "/menu", etiqueta: "Menú" },
  { href: "/reservas", etiqueta: "Reservar" },
  { href: "/pedidos", etiqueta: "Mis pedidos" },
];

export function NavbarCliente() {
  const pathname = usePathname();

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

        <div className="flex items-center gap-4">
          <Link
            href="/checkout"
            aria-label="Carrito"
            className="inline-flex size-11 items-center justify-center rounded-control text-brown outline-none hover:bg-cream focus-visible:shadow-focus"
          >
            <ShoppingCart aria-hidden className="size-6" />
          </Link>
          <Link
            href="/login"
            className="hidden min-h-11 items-center rounded-control bg-crimson px-6 py-3 text-base font-semibold text-white outline-none hover:bg-crimson-hover focus-visible:shadow-focus md:inline-flex"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}